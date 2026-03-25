import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { projectBoards, projectColumns, projectTasks, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedFinMore() {
    console.log("🚀 Seeding FinMore project...");

    const admin = (await db.select().from(users).where(eq(users.role, "admin")).limit(1))[0];
    if (!admin) {
        console.error("❌ Admin user not found!");
        process.exit(1);
    }

    // 1. Create Board
    const [board] = await db.insert(projectBoards).values({
        title: "FinMore - Тестування Платформи",
        description: "Проєкт для автоматизації сервісу https://finmore.netlify.app/. Завдання на UI та API тести.",
    }).$returningId();

    const boardId = board.id;
    console.log(`✅ Board created with ID: ${boardId}`);

    // 2. Create Columns
    const columns = [
        { title: "To Do", order: 1, color: "bg-slate-500" },
        { title: "In Progress", order: 2, color: "bg-blue-500" },
        { title: "Review", order: 3, color: "bg-purple-500" },
        { title: "Done", order: 4, color: "bg-emerald-500" },
    ];

    const insertedColumns = [];
    for (const col of columns) {
        const [insertedCol] = await db.insert(projectColumns).values({
            boardId,
            title: col.title,
            order: col.order,
            color: col.color,
        }).$returningId();
        insertedColumns.push({ ...col, id: insertedCol.id });
    }
    console.log("✅ Columns created.");

    const todoColId = insertedColumns.find(c => c.title === "To Do")!.id;

    // 3. Create Tasks
    const tasks = [
        {
            title: "Перевірка Title та Meta",
            description: "Написати тест, який відкриває https://finmore.netlify.app/ та перевіряє, що заголовок сторінки містить 'FinMore'.",
            priority: "medium" as const,
        },
        {
            title: "Тестування форми входу",
            description: "Автоматизувати негативний сценарій входу з невірними даними. Перевірити появу помилки 'Invalid credentials'.",
            priority: "high" as const,
        },
        {
            title: "Валідація футера",
            description: "Перевірити наявність посилань на соцмережі та копірайту '© 2024 FinMore' у футері сайту.",
            priority: "low" as const,
        },
        {
            title: "Перевірка адаптивності (Mobile)",
            description: "Запустити тести в емуляції iPhone 13 та перевірити, що бургер-меню відображається та відкривається.",
            priority: "medium" as const,
        },
        {
            title: "Тестування API: Health Check",
            description: "Написати API тест для перевірки головного ендпоінту (якщо є) на статус 200.",
            priority: "critical" as const,
        }
    ];

    for (const [index, t] of tasks.entries()) {
        await db.insert(projectTasks).values({
            boardId,
            columnId: todoColId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            creatorId: admin.id,
            status: "todo",
            order: index + 1,
        });
    }

    console.log("✅ Tasks created.");
    console.log("🏁 FinMore project seeded successfully!");
}

seedFinMore()
    .catch(console.error)
    .finally(() => process.exit(0));
