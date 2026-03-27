import { db } from "../src/db/index"
import { tasks, tracks, results } from "../src/db/schema"
import { sql, eq } from "drizzle-orm"
import { level1Tasks } from "../src/db/data/level1_1"
import { level1Tasks_2 } from "../src/db/data/level1_2"
import { level1Tasks_3 } from "../src/db/data/level1_3"
import { level1Tasks_4 } from "../src/db/data/level1_4"
import { level2Tasks_1 } from "../src/db/data/level2_1"
import { level2Tasks_2 } from "../src/db/data/level2_2"
import { level2Tasks_3 } from "../src/db/data/level2_3"
import { level3Tasks_1 } from "../src/db/data/level3_1"
import { level3Tasks_2 } from "../src/db/data/level3_2"
import { level4Tasks_1 } from "../src/db/data/level4_1"
import { level4Tasks_2 } from "../src/db/data/level4_2"
import { level5Tasks_1 } from "../src/db/data/level5_1"
import { level5Tasks_2 } from "../src/db/data/level5_2"
import { level6Tasks } from "../src/db/data/level6_1"
import { level7Tasks } from "../src/db/data/level7_1"
import { level8Tasks } from "../src/db/data/level8_1"
import { level9Tasks } from "../src/db/data/level9_1"
import { level10Tasks } from "../src/db/data/level10_1"
import { taskQuestions as taskQuestionsTable } from "../src/db/schema"
import * as fs from "fs"
import * as path from "path"


export async function seedDatabase() {
    console.log("💎 ЗАПУСК ПРЕМІУМ-ОНОВЛЕННЯ З ІМПОРТАМИ (50 УРОКІВ)...")

    // We no longer use TRUNCATE to preserve user data (results, questions, etc.)
    // await db.execute(sql`TRUNCATE TABLE "results", "tasks", "tracks" RESTART IDENTITY CASCADE`)

    const imp = "import { test, expect } from '@playwright/test';\n\n";
    const impPage = "import { test, expect, Page } from '@playwright/test';\n\n";

    // ==========================================
    // Рівень 1 — Base (15 завдань)
    // ==========================================
    await db.insert(tracks).values({
        title: "Рівень 1 — Base (Основи майстерності)",
        description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
        order: 1,
        isActive: true
    }).onDuplicateKeyUpdate({
        set: {
            description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
            order: 1,
            isActive: true
        }
    })
    
    const [level1] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 1 — Base (Основи майстерності)"));

    // Helper to add tasks to a track
    async function addTasks(trackId: number, tasksList: any[], difficulty: "easy" | "medium" | "hard" = "easy") {
        const quizQuestionsPath = path.join(process.cwd(), "src/db/data/quiz-questions.json");
        const quizQuestions = JSON.parse(fs.readFileSync(quizQuestionsPath, "utf-8"));

        let currentOrder = 1;
        for (const t of tasksList) {
            await db.insert(tasks).values({
                trackId,
                title: t.title,
                description: t.description,
                initialCode: t.code,
                difficulty,
                type: (t.type as "code" | "quiz") || "code",
                options: null, // Always use task_questions table now
                correctAnswer: null,
                order: currentOrder++,
                isActive: true
            }).onDuplicateKeyUpdate({
                set: {
                    difficulty,
                    type: (t.type as "code" | "quiz") || "code",
                    options: null,
                    correctAnswer: null,
                    order: currentOrder - 1,
                    isActive: true
                }
            })

            const [task] = await db.select().from(tasks).where(
                sql`${tasks.title} = ${t.title} AND ${tasks.trackId} = ${trackId}`
            ).limit(1);

            if (!task) {
                console.error(`❌ Не вдалося знайти таску після вставки: ${t.title}`);
                continue;
            }

            const taskId = task.id;

            // Sync quiz questions
            const questionsForTask = quizQuestions[t.title];
            if (questionsForTask && Array.isArray(questionsForTask)) {
                // From JSON file
                await db.delete(taskQuestionsTable).where(eq(taskQuestionsTable.taskId, taskId));
                let qOrder = 1;
                for (const q of questionsForTask) {
                    await db.insert(taskQuestionsTable).values({
                        taskId,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        order: qOrder++
                    });
                }
                console.log(`✅ Портовано ${questionsForTask.length} питань для: ${t.title}`);
            } else if (t.type === "quiz" && t.options && t.correctAnswer) {
                // Inline options from the data file (levels 7-10 style)
                await db.delete(taskQuestionsTable).where(eq(taskQuestionsTable.taskId, taskId));
                await db.insert(taskQuestionsTable).values({
                    taskId,
                    text: t.title,
                    options: t.options,
                    correctAnswer: t.correctAnswer,
                    order: 1
                });
                console.log(`✅ Додано inline варіанти для: ${t.title}`);
            }
        }
    }

    await addTasks(level1.id, [
        ...level1Tasks,
        ...level1Tasks_2,
        ...level1Tasks_3,
        ...level1Tasks_4
    ], "easy")

    // Рівень 2 (12 завдань)
    await db.insert(tracks).values({ title: "Рівень 2 — Structure (Архітектор)", description: "Створення масштабованих систем.", order: 2, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Створення масштабованих систем.", order: 2, isActive: true }
        })
    const [level2] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 2 — Structure (Архітектор)"));
    await addTasks(level2.id, [
        ...level2Tasks_1,
        ...level2Tasks_2,
        ...level2Tasks_3
    ], "medium")

    // Рівень 3 (13 завдань)
    await db.insert(tracks).values({ title: "Рівень 3 — Advanced (Senior)", description: "Інтеграції та мокінг.", order: 3, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Інтеграції та мокінг.", order: 3, isActive: true }
        })
    const [level3] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 3 — Advanced (Senior)"));
    await addTasks(level3.id, [
        ...level3Tasks_1,
        ...level3Tasks_2
    ], "hard")

    // Рівень 4 (10 завдань)
    await db.insert(tracks).values({ title: "Рівень 4 — Best Practices (Lead)", description: "Інфраструктура та CI/CD.", order: 4, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Інфраструктура та CI/CD.", order: 4, isActive: true }
        })
    const [level4] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 4 — Best Practices (Lead)"));
    await addTasks(level4.id, [
        ...level4Tasks_1,
        ...level4Tasks_2
    ], "hard")


    // Рівень 5 (Challenge)
    await db.insert(tracks).values({ title: "Рівень 5 — Real World (Виклики)", description: "Реальні сценарії з багами та складнощами.", order: 5, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Реальні сценарії з багами та складнощами.", order: 5, isActive: true }
        })
    const [level5] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 5 — Real World (Виклики)"));
    await addTasks(level5.id, [
        ...level5Tasks_1,
        ...level5Tasks_2
    ], "hard")

    // Рівень 6 (Quiz)
    await db.insert(tracks).values({ title: "Рівень 6 — Quiz (Тести)", description: "Перевірка знань без написання коду.", order: 6, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Перевірка знань без написання коду.", order: 6, isActive: true }
        })
    const [level6] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 6 — Quiz (Тести)"));
    await addTasks(level6.id, [
        ...level6Tasks
    ], "easy")

    // Рівень 7 (Auth & Sessions)
    await db.insert(tracks).values({ title: "Рівень 7 — Auth & Sessions (Авторизація)", description: "Авторизація, куки, Storage State та JWT у тестах.", order: 7, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Авторизація, куки, Storage State та JWT у тестах.", order: 7, isActive: true }
        })
    const [level7] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 7 — Auth & Sessions (Авторизація)"));
    await addTasks(level7.id, [...level7Tasks], "hard")

    // Рівень 8 (Architecture & POM)
    await db.insert(tracks).values({ title: "Рівень 8 — Architecture (Архітектура)", description: "Page Object Model, паттерни проектування та організація тестів.", order: 8, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Page Object Model, паттерни проектування та організація тестів.", order: 8, isActive: true }
        })
    const [level8] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 8 — Architecture (Архітектура)"));
    await addTasks(level8.id, [...level8Tasks], "hard")

    // Рівень 9 (Advanced Testing)
    await db.insert(tracks).values({ title: "Рівень 9 — Advanced (Просунуте тестування)", description: "Візуальне тестування, accessibility, performance та WebSocket.", order: 9, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "Візуальне тестування, accessibility, performance та WebSocket.", order: 9, isActive: true }
        })
    const [level9] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 9 — Advanced (Просунуте тестування)"));
    await addTasks(level9.id, [...level9Tasks], "hard")

    // Рівень 10 (CI/CD & Professional)
    await db.insert(tracks).values({ title: "Рівень 10 — Professional (Фінальний бос)", description: "CI/CD, Docker, Sharding, Allure та AI-assisted тестування.", order: 10, isActive: true })
        .onDuplicateKeyUpdate({
            set: { description: "CI/CD, Docker, Sharding, Allure та AI-assisted тестування.", order: 10, isActive: true }
        })
    const [level10] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 10 — Professional (Фінальний бос)"));
    await addTasks(level10.id, [...level10Tasks], "hard")

    console.log("🏁✅ ОНОВЛЕННЯ ЗАВЕРШЕНЕ! 100 завдань завантажені — 10 рівнів повного курсу!")
}

seedDatabase()
    .then(() => {
        console.log("✅ Import completed successfully.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Import failed:", err);
        process.exit(1);
    });
