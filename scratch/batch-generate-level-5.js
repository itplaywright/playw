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

async function generateTaskData(task, trackContext) {
    const prompt = `You are a Principal Test Automation Architect creating advanced real-world Playwright challenges.
Create comprehensive, engaging learning materials in 3 languages (UK, EN, RU) for the following practical challenge:
Task Number: "${task.numbering || ''}"
Task Topic: "${task.title}"
Context: This is ${trackContext}

Return a STRICT JSON object with these EXACT keys:
{
  "titleEn": "English title without number",
  "titleRu": "Russian title without number",
  "descriptionUk": "Comprehensive Markdown description in UKRAINIAN. Include: ## Title with emoji, **Теорія** (real-world production problem breakdown), **Приклад** (realistic Playwright solution with clear comments), ### Завдання (clear step-by-step challenge instructions).",
  "descriptionEn": "Comprehensive Markdown description in ENGLISH. Same structure.",
  "descriptionRu": "Comprehensive Markdown description in RUSSIAN. Same structure.",
  "initialCodeUk": "Realistic Playwright test code with UKRAINIAN comments (// TODO: 1. ...), test setup, realistic scenarios, and placeholder gaps (/* впишіть код сюди */). Pure code only, NO markdown fences.",
  "initialCodeEn": "Same code with ENGLISH comments. Pure code only, NO markdown fences.",
  "initialCodeRu": "Same code with RUSSIAN comments. Pure code only, NO markdown fences."
}`;
    return await callGemini(prompt);
}

async function main() {
    const TRACK_ID = 6;
    const TRACK_CONTEXT = 'Track: "Рівень 5 — Real World (Виклики)" for QA automation engineers solving tricky real-world scenarios: complex E-commerce flows, flaky animation waits, shadow DOM elements, 500 server error simulations, multi-tab window popups, download/upload verification, iframe widgets, alert/confirm handling, and visual regression.';

    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [tasks] = await conn.query(
            "SELECT id, numbering, title FROM tasks WHERE track_id = ? AND title_en IS NULL ORDER BY id ASC",
            [TRACK_ID]
        );
        console.log(`\nTasks to generate for Track ${TRACK_ID} (Level 5 - Real World): ${tasks.length}\n`);

        let ok = 0, fail = 0;
        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            console.log(`[${i+1}/${tasks.length}] #${t.id}: ${t.numbering || ''} ${t.title}...`);

            const result = await generateTaskData(t, TRACK_CONTEXT);
            if (!result || !result.titleEn) {
                console.error(`  ✗ FAILED\n`);
                fail++;
                continue;
            }

            await conn.query(
                `UPDATE tasks SET
                    title_en = ?, title_ru = ?,
                    description = ?, description_en = ?, description_ru = ?,
                    initial_code = ?, initial_code_en = ?, initial_code_ru = ?
                WHERE id = ?`,
                [
                    result.titleEn, result.titleRu,
                    result.descriptionUk, result.descriptionEn, result.descriptionRu,
                    result.initialCodeUk, result.initialCodeEn, result.initialCodeRu,
                    t.id
                ]
            );
            ok++;
            console.log(`  ✓ ${result.titleEn}\n`);
            await delay(4000);
        }

        console.log(`\n🎉 DONE Level 5! Success: ${ok}, Failed: ${fail}`);
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
