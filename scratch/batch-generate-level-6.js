require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const keys = [
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY
].filter(Boolean);

console.log(`Initialized with ${keys.length} API keys.`);

let currentKeyIndex = 0;
function getKey() {
    return keys[currentKeyIndex % keys.length];
}
function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`Rotating to API Key #${currentKeyIndex + 1}`);
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callGemini(promptText) {
    const model = "gemini-3.8-flash";

    for (let attempt = 1; attempt <= keys.length * 2; attempt++) {
        const activeKey = getKey();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
                })
            });

            const data = await res.json();
            if (data.error) {
                console.warn(`  Key #${(currentKeyIndex % keys.length) + 1} Error: ${data.error.message.slice(0, 150)}...`);
                rotateKey();
                await delay(3000);
                continue;
            }

            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error("Empty response");
            return JSON.parse(rawText);
        } catch (e) {
            console.warn(`  Exception on Key #${(currentKeyIndex % keys.length) + 1}: ${e.message}`);
            rotateKey();
            await delay(3000);
        }
    }
    return null;
}

async function translateQuestions(questions) {
    const prompt = `You are a QA automation expert. Translate the following quiz questions, their multiple-choice options, and their correct answers into ENGLISH and RUSSIAN.
Input Questions (Ukrainian):
${JSON.stringify(questions, null, 2)}

Return a STRICT JSON array matching the same order, with these keys for each question:
[
  {
    "id": <same id>,
    "textEn": "Question in English",
    "textRu": "Question in Russian",
    "optionsEn": ["option 1 in EN", "option 2 in EN", "option 3 in EN", "option 4 in EN"],
    "optionsRu": ["option 1 in RU", "option 2 in RU", "option 3 in RU", "option 4 in RU"],
    "correctAnswerEn": "exact match to correct option in optionsEn",
    "correctAnswerRu": "exact match to correct option in optionsRu"
  }
]`;

    return await callGemini(prompt);
}

async function generateTaskDescription(task) {
    const prompt = `You are a Principal Test Automation Architect.
Generate English and Russian titles and educational descriptions for this Playwright Quiz topic:
Topic: "${task.title}"
Context: Track "Рівень 6 — Quiz (Тести)" for QA engineers.

Return a STRICT JSON object:
{
  "titleEn": "English title without numbering",
  "titleRu": "Russian title without numbering",
  "descriptionEn": "Educational theory in ENGLISH explaining this topic thoroughly with code examples. Use Markdown.",
  "descriptionRu": "Educational theory in RUSSIAN explaining this topic thoroughly with code examples. Use Markdown."
}`;

    return await callGemini(prompt);
}

async function main() {
    const TRACK_ID = 7;
    const conn = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        const [tasks] = await conn.query(
            "SELECT id, numbering, title FROM tasks WHERE track_id = ? ORDER BY id ASC",
            [TRACK_ID]
        );
        console.log(`\nProcessing Track ${TRACK_ID} (Quiz). Total tasks: ${tasks.length}\n`);

        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            console.log(`[${i+1}/${tasks.length}] Processing Quiz #${t.id}: ${t.numbering || ''} ${t.title}...`);

            // 1. Update Task Title & Description
            const taskDetails = await generateTaskDescription(t);
            if (taskDetails && taskDetails.titleEn) {
                await conn.query(
                    `UPDATE tasks SET title_en = ?, title_ru = ?, description_en = ?, description_ru = ? WHERE id = ?`,
                    [taskDetails.titleEn, taskDetails.titleRu, taskDetails.descriptionEn, taskDetails.descriptionRu, t.id]
                );
                console.log(`  ✓ Updated Task metadata: ${taskDetails.titleEn}`);
            }

            await delay(3000);

            // 2. Fetch and translate all questions for this task
            const [questions] = await conn.query(
                "SELECT id, text, options, correct_answer FROM task_questions WHERE task_id = ? ORDER BY `order` ASC",
                [t.id]
            );

            if (questions.length > 0) {
                console.log(`  Translating ${questions.length} questions...`);
                const formatted = questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                    correctAnswer: q.correct_answer
                }));

                const translated = await translateQuestions(formatted);
                if (Array.isArray(translated)) {
                    for (const tr of translated) {
                        await conn.query(
                            `UPDATE task_questions SET
                                text_en = ?,
                                text_ru = ?,
                                options_en = ?,
                                options_ru = ?,
                                correct_answer_en = ?,
                                correct_answer_ru = ?
                            WHERE id = ?`,
                            [
                                tr.textEn,
                                tr.textRu,
                                JSON.stringify(tr.optionsEn),
                                JSON.stringify(tr.optionsRu),
                                tr.correctAnswerEn,
                                tr.correctAnswerRu,
                                tr.id
                            ]
                        );
                    }
                    console.log(`  ✓ Successfully translated ${translated.length} questions!\n`);
                } else {
                    console.warn(`  ✗ Failed to parse translated questions\n`);
                }
            } else {
                console.log(`  (No questions found)\n`);
            }

            await delay(4000);
        }

        console.log(`\n🎉 DONE Level 6 (Quiz)!`);
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
