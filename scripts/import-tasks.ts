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
        order: 1
    }).onDuplicateKeyUpdate({
        set: {
            description: "Фундамент автоматизації: від першого кліку до мобільної емуляції.",
            order: 1
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
                order: currentOrder++
            }).onDuplicateKeyUpdate({
                set: {
                    difficulty,
                    type: (t.type as "code" | "quiz") || "code",
                    options: null,
                    correctAnswer: null,
                    order: currentOrder - 1
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
                // Remove old questions
                await db.delete(taskQuestionsTable).where(eq(taskQuestionsTable.taskId, taskId));

                // Insert new ones
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
    await db.insert(tracks).values({ title: "Рівень 2 — Structure (Архітектор)", description: "Створення масштабованих систем.", order: 2 })
        .onDuplicateKeyUpdate({
            set: { description: "Створення масштабованих систем.", order: 2 }
        })
    const [level2] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 2 — Structure (Архітектор)"));
    await addTasks(level2.id, [
        ...level2Tasks_1,
        ...level2Tasks_2,
        ...level2Tasks_3
    ], "medium")

    // Рівень 3 (13 завдань)
    await db.insert(tracks).values({ title: "Рівень 3 — Advanced (Senior)", description: "Інтеграції та мокінг.", order: 3 })
        .onDuplicateKeyUpdate({
            set: { description: "Інтеграції та мокінг.", order: 3 }
        })
    const [level3] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 3 — Advanced (Senior)"));
    await addTasks(level3.id, [
        ...level3Tasks_1,
        ...level3Tasks_2
    ], "hard")

    // Рівень 4 (10 завдань)
    await db.insert(tracks).values({ title: "Рівень 4 — Best Practices (Lead)", description: "Інфраструктура та CI/CD.", order: 4 })
        .onDuplicateKeyUpdate({
            set: { description: "Інфраструктура та CI/CD.", order: 4 }
        })
    const [level4] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 4 — Best Practices (Lead)"));
    await addTasks(level4.id, [
        ...level4Tasks_1,
        ...level4Tasks_2
    ], "hard")


    // Рівень 5 (Challenge)
    await db.insert(tracks).values({ title: "Рівень 5 — Real World (Виклики)", description: "Реальні сценарії з багами та складнощами.", order: 5 })
        .onDuplicateKeyUpdate({
            set: { description: "Реальні сценарії з багами та складнощами.", order: 5 }
        })
    const [level5] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 5 — Real World (Виклики)"));
    await addTasks(level5.id, [
        ...level5Tasks_1,
        ...level5Tasks_2
    ], "hard")

    // Рівень 6 (Quiz)
    await db.insert(tracks).values({ title: "Рівень 6 — Quiz (Тести)", description: "Перевірка знань без написання коду.", order: 6 })
        .onDuplicateKeyUpdate({
            set: { description: "Перевірка знань без написання коду.", order: 6 }
        })
    const [level6] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 6 — Quiz (Тести)"));
    await addTasks(level6.id, [
        ...level6Tasks
    ], "easy")

    console.log("🏁✅ ОНОВЛЕННЯ ЗАВЕРШЕНЕ! 60 завдань з імпортами завантажені.")
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
