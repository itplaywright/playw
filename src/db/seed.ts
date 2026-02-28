import { config } from "dotenv";
config({ path: ".env.local" });

async function seed() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL не знайдено");
    }

    console.log("⚠️ АВТОМАТИЧНИЙ СІД ВИМКНЕНО ДЛЯ ЗАХИСТУ ДАНИХ ⚠️");
    console.log("Всі зміни в завданнях тепер вносяться вручну в базі даних.");

    /* 
    const { seedDatabase } = await import("./seed-data");
    await seedDatabase(); 
    */
}

seed().catch(console.error).finally(() => process.exit(0))
