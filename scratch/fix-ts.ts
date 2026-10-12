import { db } from "../src/db/index.js";
import { tracks, tasks } from "../src/db/schema.js";
import { eq, inArray } from "drizzle-orm";

const trackId = 72; // Рівень 0 — Основи TypeScript

const cleanTasks = [
    {
        numbering: "0.1",
        title: "Змінні: const та let",
        titleEn: "Variables: const and let",
        titleRu: "Переменные: const и let",
        description: "Основи оголошення змінних.",
        descriptionEn: "Basics of variable declaration.",
        descriptionRu: "Основы объявления переменных.",
        initialCode: "const x = 5;\nlet y = 10;",
    },
    {
        numbering: "0.2",
        title: "Типи даних: String & Number",
        titleEn: "Data Types: String & Number",
        titleRu: "Типы данных: String и Number",
        description: "Робота з текстом та числами.",
        descriptionEn: "Working with text and numbers.",
        descriptionRu: "Работа с текстом и числами.",
        initialCode: "const name = 'Playwright';\nconst version = 1.0;",
    },
    {
        numbering: "0.3",
        title: "Логічний тип: Boolean",
        titleEn: "Logical Type: Boolean",
        titleRu: "Логический тип: Boolean",
        description: "Правда чи брехня.",
        descriptionEn: "True or false.",
        descriptionRu: "Правда или ложь.",
        initialCode: "const isDone = false;",
    },
    {
        numbering: "0.4",
        title: "Асинхронність: await",
        titleEn: "Asynchrony: await",
        titleRu: "Асинхронность: await",
        description: "Очікування виконання промісів.",
        descriptionEn: "Waiting for promise execution.",
        descriptionRu: "Ожидание выполнения промисов.",
        initialCode: "await page.goto('https://example.com');",
    },
    {
        numbering: "0.5",
        title: "Функції та async",
        titleEn: "Functions and async",
        titleRu: "Функции и async",
        description: "Створення асинхронних функцій.",
        descriptionEn: "Creating asynchronous functions.",
        descriptionRu: "Создание асинхронных функций.",
        initialCode: "async function test() {}",
    },
    {
        numbering: "0.6",
        title: "Об'єкти: Основи",
        titleEn: "Objects: Basics",
        titleRu: "Объекты: Основы",
        description: "Зберігання даних у форматі ключ-значення.",
        descriptionEn: "Storing data in key-value format.",
        descriptionRu: "Хранение данных в формате ключ-значение.",
        initialCode: "const user = { name: 'Admin' };",
    },
    {
        numbering: "0.7",
        title: "Деструктуризація",
        titleEn: "Destructuring",
        titleRu: "Деструктуризация",
        description: "Витягнення значень з об'єктів.",
        descriptionEn: "Extracting values from objects.",
        descriptionRu: "Извлечение значений из объектов.",
        initialCode: "const { page } = testArgs;",
    },
    {
        numbering: "0.8",
        title: "Масиви: Списки даних",
        titleEn: "Arrays: Data Lists",
        titleRu: "Массивы: Списки данных",
        description: "Робота з масивами.",
        descriptionEn: "Working with arrays.",
        descriptionRu: "Работа с массивами.",
        initialCode: "const items = [1, 2, 3];",
    },
    {
        numbering: "0.9",
        title: "Шаблонні рядки",
        titleEn: "Template Literals",
        titleRu: "Шаблонные строки",
        description: "Вставка змінних у рядки.",
        descriptionEn: "Inserting variables into strings.",
        descriptionRu: "Вставка переменных в строки.",
        initialCode: "const msg = `Hello ${name}`;",
    },
    {
        numbering: "0.10",
        title: "Порівняння: === та !==",
        titleEn: "Comparison: === and !==",
        titleRu: "Сравнение: === и !==",
        description: "Суворе порівняння.",
        descriptionEn: "Strict comparison.",
        descriptionRu: "Строгое сравнение.",
        initialCode: "if (x === y) {}",
    },
    {
        numbering: "0.11",
        title: "Умови: if / else",
        titleEn: "Conditions: if / else",
        titleRu: "Условия: if / else",
        description: "Умовні конструкції.",
        descriptionEn: "Conditional statements.",
        descriptionRu: "Условные конструкции.",
        initialCode: "if (true) {} else {}",
    },
    {
        numbering: "0.12",
        title: "Стрілочні функції",
        titleEn: "Arrow Functions",
        titleRu: "Стрелочные функции",
        description: "Короткий синтаксис функцій.",
        descriptionEn: "Short syntax for functions.",
        descriptionRu: "Краткий синтаксис функций.",
        initialCode: "const doIt = () => {};",
    },
    {
        numbering: "0.13",
        title: "Опційне ланцюгування (?.)",
        titleEn: "Optional Chaining (?.)",
        titleRu: "Опциональная цепочка (?.)",
        description: "Безпечний доступ до властивостей.",
        descriptionEn: "Safe property access.",
        descriptionRu: "Безопасный доступ к свойствам.",
        initialCode: "const name = obj?.user?.name;",
    },
    {
        numbering: "0.14",
        title: "Обробка помилок: try / catch",
        titleEn: "Error Handling: try / catch",
        titleRu: "Обработка ошибок: try / catch",
        description: "Перехоплення помилок.",
        descriptionEn: "Catching errors.",
        descriptionRu: "Перехват ошибок.",
        initialCode: "try {} catch(e) {}",
    },
    {
        numbering: "0.15",
        title: "Імпорт: import",
        titleEn: "Imports: import",
        titleRu: "Импорт: import",
        description: "Підключення модулів.",
        descriptionEn: "Including modules.",
        descriptionRu: "Подключение модулей.",
        initialCode: "import { test } from '@playwright/test';",
    }
];

async function main() {
    console.log("Updating track 72 translations...");
    await db.update(tracks)
        .set({
            titleEn: "Level 0 — TypeScript Basics",
            titleRu: "Уровень 0 — Основы TypeScript",
            descriptionEn: "Basic language concepts needed for a quick start with autotests.",
            descriptionRu: "Базовые концепции языка, необходимые для быстрого старта с автотестами."
        })
        .where(eq(tracks.id, trackId));

    console.log("Deleting old tasks for track 72...");
    await db.delete(tasks).where(eq(tasks.trackId, trackId));

    console.log("Inserting clean translated tasks...");
    for (let i = 0; i < cleanTasks.length; i++) {
        const t = cleanTasks[i];
        await db.insert(tasks).values({
            trackId: trackId,
            numbering: t.numbering,
            title: t.title,
            titleEn: t.titleEn,
            titleRu: t.titleRu,
            description: t.description,
            descriptionEn: t.descriptionEn,
            descriptionRu: t.descriptionRu,
            initialCode: t.initialCode,
            order: i + 1,
            type: "code"
        });
    }

    console.log("Done!");
    process.exit(0);
}

main();
