import { db } from "../src/db/index";
import { tasks, tracks, results, taskQuestions } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";

async function removeOldTasks() {
    console.log("Пошук старих завдань...");

    const [level1] = await db.select().from(tracks).where(eq(tracks.title, "Рівень 6 — Quiz (Тести)"));
    
    if (!level1) {
        console.log("Рівень не знайдено");
        return;
    }

    const allTasks = await db.select().from(tasks).where(eq(tasks.trackId, level1.id));
    
    console.log(`Всього знайдено задач в рівні 6: ${allTasks.length}`);

    // Старі завдання мають короткий текст (до ~600 символів), нові — понад 1000
    const oldTasks = allTasks.filter(t => t.description.length < 900);
    const oldTaskIds = oldTasks.map(t => t.id);

    console.log(`З нихкових старих задач: ${oldTaskIds.length}`);
    oldTasks.forEach(t => console.log(`- ID: ${t.id}, Length: ${t.description.length}, Title: ${t.title}`));

    if (oldTaskIds.length > 0) {
        // 1. Спочатку видаляємо results, які посилаються на задачі
        await db.delete(results).where(inArray(results.taskId, oldTaskIds));
        console.log("✅ Видалено пов'язані результати");

        // 2. В таблиці task_questions стоїть onDelete cascade, але для надійності:
        await db.delete(taskQuestions).where(inArray(taskQuestions.taskId, oldTaskIds));
        console.log("✅ Видалено пов'язані питання (quiz)");

        // 3. Видаляємо самі задачі
        await db.delete(tasks).where(inArray(tasks.id, oldTaskIds));
        console.log(`✅ Видалено ${oldTaskIds.length} старих задач`);
    } else {
        console.log("Старих задач не знайдено, або вони вже видалені.");
    }
}

removeOldTasks().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
