import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { projectTasks, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function addAuthTasks() {
    console.log("🔐 Adding Auth & Registration tasks to FinMore...");

    const admin = (await db.select().from(users).where(eq(users.role, "admin")).limit(1))[0];
    const boardId = 1;
    const todoColId = 1;

    const newTasks = [
        {
            title: "Валідація Email при реєстрації",
            description: "Перевірити, що поле реєстрації видає помилку при введенні некоректного формату пошти (наприклад, без '@' або без домену).",
            priority: "high" as const,
        },
        {
            title: "Тестування сили паролю",
            description: "Перевірити наявність індикатора сили паролю або вимог валідації (мінімум 8 символів, наявність цифр та спецсимволів).",
            priority: "medium" as const,
        },
        {
            title: "Реєстрація: Успішний кейс",
            description: "Створити повний тест-кейс реєстрації нового користувача з унікальними даними. Перевірити редірект на Dashboard.",
            priority: "critical" as const,
        },
        {
            title: "Вхід: Валідація обов'язкових полів",
            description: "Спробувати натиснути 'Увійти' з порожніми полями та перевірити появу тексту повідомлення про обов'язковість полів.",
            priority: "medium" as const,
        },
        {
            title: "Запам'ятати мене (Remember Me)",
            description: "Перевірити збереження сесії в Cookie після перезавантаження сторінки, якщо при вході було обрано чекбокс 'Remember me'.",
            priority: "medium" as const,
        },
        {
            title: "Відновлення паролю: UI чек",
            description: "Перевірити перехід за посиланням 'Забули пароль?' та відображення форми для введення пошти для відновлення.",
            priority: "low" as const,
        },
        {
            title: "Logout: Очищення сесії",
            description: "Перевірити, що після натискання 'Вийти' користувач повертається на сторінку входу, а сесія в Cookie видаляється.",
            priority: "high" as const,
        }
    ];

    for (const [index, t] of newTasks.entries()) {
        await db.insert(projectTasks).values({
            boardId,
            columnId: todoColId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            creatorId: admin.id,
            status: "todo",
            order: index + 10, // Start after previous tasks
        });
    }

    console.log(`✅ Added ${newTasks.length} auth tasks.`);
    console.log("🏁 Done!");
}

addAuthTasks()
    .catch(console.error)
    .finally(() => process.exit(0));
