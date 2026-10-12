import { db } from "../src/db/index.js";
import { tracks, tasks } from "../src/db/schema.js";
import { eq, inArray } from "drizzle-orm";

const trackId = 72; // Рівень 0 — Основи TypeScript

const updates = [
    { id: 1025, num: "0.1", title: "Змінні: const та let", titleEn: "Variables: const and let", titleRu: "Переменные: const и let", desc: "Основи оголошення змінних.", descEn: "Basics of variable declaration.", descRu: "Основы объявления переменных." },
    { id: 1046, num: "0.2", title: "Типи даних: String & Number", titleEn: "Data Types: String & Number", titleRu: "Типы данных: String и Number", desc: "Робота з текстом та числами.", descEn: "Working with text and numbers.", descRu: "Работа с текстом и числами." },
    { id: 1047, num: "0.3", title: "Логічний тип: Boolean", titleEn: "Logical Type: Boolean", titleRu: "Логический тип: Boolean", desc: "Правда чи брехня.", descEn: "True or false.", descRu: "Правда или ложь." },
    { id: 1048, num: "0.4", title: "Асинхронність: await", titleEn: "Asynchrony: await", titleRu: "Асинхронность: await", desc: "Очікування виконання промісів.", descEn: "Waiting for promise execution.", descRu: "Ожидание выполнения промисов." },
    { id: 1049, num: "0.5", title: "Функції та async", titleEn: "Functions and async", titleRu: "Функции и async", desc: "Створення асинхронних функцій.", descEn: "Creating asynchronous functions.", descRu: "Создание асинхронных функций." },
    { id: 1050, num: "0.6", title: "Об'єкти: Основи", titleEn: "Objects: Basics", titleRu: "Объекты: Основы", desc: "Зберігання даних у форматі ключ-значення.", descEn: "Storing data in key-value format.", descRu: "Хранение данных в формате ключ-значение." },
    { id: 1051, num: "0.7", title: "Деструктуризація", titleEn: "Destructuring", titleRu: "Деструктуризация", desc: "Витягнення значень з об'єктів.", descEn: "Extracting values from objects.", descRu: "Извлечение значений из объектов." },
    { id: 1052, num: "0.8", title: "Масиви: Списки даних", titleEn: "Arrays: Data Lists", titleRu: "Массивы: Списки данных", desc: "Робота з масивами.", descEn: "Working with arrays.", descRu: "Работа с массивами." },
    { id: 1053, num: "0.9", title: "Шаблонні рядки", titleEn: "Template Literals", titleRu: "Шаблонные строки", desc: "Вставка змінних у рядки.", descEn: "Inserting variables into strings.", descRu: "Вставка переменных в строки." },
    { id: 1054, num: "0.10", title: "Порівняння: === та !==", titleEn: "Comparison: === and !==", titleRu: "Сравнение: === и !==", desc: "Суворе порівняння.", descEn: "Strict comparison.", descRu: "Строгое сравнение." },
    { id: 1055, num: "0.11", title: "Умови: if / else", titleEn: "Conditions: if / else", titleRu: "Условия: if / else", desc: "Умовні конструкції.", descEn: "Conditional statements.", descRu: "Условные конструкции." },
    { id: 1056, num: "0.12", title: "Стрілочні функції", titleEn: "Arrow Functions", titleRu: "Стрелочные функции", desc: "Короткий синтаксис функцій.", descEn: "Short syntax for functions.", descRu: "Краткий синтаксис функций." },
    { id: 1057, num: "0.13", title: "Опційне ланцюгування (?.)", titleEn: "Optional Chaining (?.)", titleRu: "Опциональная цепочка (?.)", desc: "Безпечний доступ до властивостей.", descEn: "Safe property access.", descRu: "Безопасный доступ к свойствам." },
    { id: 1058, num: "0.14", title: "Обробка помилок: try / catch", titleEn: "Error Handling: try / catch", titleRu: "Обработка ошибок: try / catch", desc: "Перехоплення помилок.", descEn: "Catching errors.", descRu: "Перехват ошибок." },
    { id: 1059, num: "0.15", title: "Імпорт: import", titleEn: "Imports: import", titleRu: "Импорт: import", desc: "Підключення модулів.", descEn: "Including modules.", descRu: "Подключение модулей." }
];

async function main() {
    console.log("Deactivating old duplicate tasks (1026-1029)...");
    await db.update(tasks).set({ isActive: false }).where(inArray(tasks.id, [1026, 1027, 1028, 1029]));

    console.log("Updating translations and order for the 15 active tasks...");
    for (let i = 0; i < updates.length; i++) {
        const u = updates[i];
        await db.update(tasks)
            .set({
                numbering: u.num,
                title: u.title,
                titleEn: u.titleEn,
                titleRu: u.titleRu,
                description: u.desc,
                descriptionEn: u.descEn,
                descriptionRu: u.descRu,
                order: i + 1,
                isActive: true
            })
            .where(eq(tasks.id, u.id));
    }

    console.log("Done!");
    process.exit(0);
}

main();
