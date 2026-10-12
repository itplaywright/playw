require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No GEMINI_API_KEY found!");
    process.exit(1);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(promptText) {
    const model = "gemini-3.8-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.7
                    }
                })
            });

            const data = await res.json();
            if (data.error) {
                console.warn(`Attempt ${attempt} error: ${data.error.message}`);
                if (attempt < 3) await delay(4000);
                continue;
            }

            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error("Empty candidate response");
            return JSON.parse(rawText);
        } catch (e) {
            console.warn(`Attempt ${attempt} exception: ${e.message}`);
            if (attempt < 3) await delay(4000);
        }
    }
    return null;
}

async function generateTaskData(task) {
    const prompt = `You are a Senior TypeScript & Playwright Automation Lead instructor.
Create comprehensive, engaging learning materials in 3 languages (UK, EN, RU) for the following student task:
Task Number: "${task.numbering || ''}"
Task Topic: "${task.title}"
Context: This is Track: "Рівень 0 — Основи TypeScript" for QA engineers preparing for Playwright automation.

Return a STRICT JSON object with these EXACT keys:
{
  "titleEn": "English title without number (e.g. Variables: const and let)",
  "titleRu": "Russian title without number (e.g. Переменные: const и let)",
  "descriptionUk": "Comprehensive Markdown description in UKRAINIAN. Include: ## Title with emoji, **Теорія** (why this is crucial in QA automation), **Приклад** (realistic code sample with comments), ### Завдання (clear instructions on what the student needs to solve).",
  "descriptionEn": "Comprehensive Markdown description in ENGLISH. Include: ## Title with emoji, **Theory** (why this is crucial in QA automation), **Example** (realistic code sample with comments), ### Task (clear instructions on what the student needs to solve).",
  "descriptionRu": "Comprehensive Markdown description in RUSSIAN. Include: ## Title with emoji, **Теория** (why this is crucial in QA automation), **Пример** (realistic code sample with comments), ### Задание (clear instructions on what the student needs to solve).",
  "initialCodeUk": "Realistic starter TypeScript code with step-by-step UKRAINIAN comments (// TODO: 1. ...), setup code, and clear gaps/blanks (/* впишіть код сюди */). Pure code, NO markdown fences.",
  "initialCodeEn": "Realistic starter TypeScript code with step-by-step ENGLISH comments (// TODO: 1. ...), setup code, and clear gaps/blanks (/* write code here */). Pure code, NO markdown fences.",
  "initialCodeRu": "Realistic starter TypeScript code with step-by-step RUSSIAN comments (// TODO: 1. ...), setup code, and clear gaps/blanks (/* впишите код сюда */). Pure code, NO markdown fences."
}`;

    return await callGemini(prompt);
}

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [tasks] = await conn.query(
            "SELECT id, numbering, title FROM tasks WHERE track_id = 72 ORDER BY `order` ASC"
        );
        console.log(`Starting generation for Track 72 (Рівень 0 — Основи TypeScript). Total tasks: ${tasks.length}`);

        let count = 0;
        for (const t of tasks) {
            count++;
            console.log(`\n[${count}/${tasks.length}] Processing task #${t.id}: ${t.numbering || ''} ${t.title}...`);

            const result = await generateTaskData(t);
            if (!result || !result.titleEn) {
                console.error(`Failed to generate data for task #${t.id}`);
                continue;
            }

            await conn.query(
                `UPDATE tasks SET 
                    title_en = ?,
                    title_ru = ?,
                    description = ?,
                    description_en = ?,
                    description_ru = ?,
                    initial_code = ?,
                    initial_code_en = ?,
                    initial_code_ru = ?
                WHERE id = ?`,
                [
                    result.titleEn,
                    result.titleRu,
                    result.descriptionUk,
                    result.descriptionEn,
                    result.descriptionRu,
                    result.initialCodeUk,
                    result.initialCodeEn,
                    result.initialCodeRu,
                    t.id
                ]
            );

            console.log(`✓ Successfully updated task #${t.id} (${result.titleEn})`);
            // Sleep 4 seconds between requests to respect rate limits
            await delay(4000);
        }

        console.log("\n🎉 ALL TASKS IN TRACK 72 COMPLETED!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
