require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const trackTranslations = [
    {
        id: 72,
        titleEn: "Level 0 — TypeScript Basics",
        titleRu: "Уровень 0 — Основы TypeScript"
    },
    {
        id: 1,
        titleEn: "Level 1 — Base (Locators & Mastery)",
        titleRu: "Уровень 1 — Base (Основы мастерства)"
    },
    {
        id: 3,
        titleEn: "Level 2 — Structure (Architect / POM)",
        titleRu: "Уровень 2 — Structure (Архитектор / POM)"
    },
    {
        id: 4,
        titleEn: "Level 3 — Advanced (Senior)",
        titleRu: "Уровень 3 — Advanced (Senior)"
    },
    {
        id: 5,
        titleEn: "Level 4 — Best Practices (Lead)",
        titleRu: "Уровень 4 — Best Practices (Lead)"
    },
    {
        id: 6,
        titleEn: "Level 5 — Real World (Challenges)",
        titleRu: "Уровень 5 — Real World (Вызовы)"
    },
    {
        id: 7,
        titleEn: "Level 6 — Quiz (Tests)",
        titleRu: "Уровень 6 — Quiz (Тесты)"
    },
    {
        id: 68,
        titleEn: "Level 7 — Auth & Sessions",
        titleRu: "Уровень 7 — Auth & Sessions (Авторизация)"
    },
    {
        id: 69,
        titleEn: "Level 8 — Architecture",
        titleRu: "Уровень 8 — Architecture (Архитектура)"
    },
    {
        id: 70,
        titleEn: "Level 9 — Advanced Testing",
        titleRu: "Уровень 9 — Advanced (Продвинутое тестирование)"
    },
    {
        id: 71,
        titleEn: "Level 10 — Professional (Final Boss)",
        titleRu: "Уровень 10 — Professional (Финальный босс)"
    }
];

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Updating track translations...");
        for (const t of trackTranslations) {
            await conn.query(
                "UPDATE tracks SET title_en = ?, title_ru = ? WHERE id = ?",
                [t.titleEn, t.titleRu, t.id]
            );
            console.log(`✓ Updated Track #${t.id}: ${t.titleEn} / ${t.titleRu}`);
        }
        console.log("All tracks translated successfully!");
    } finally {
        await conn.end();
    }
}

main().catch(console.error);
