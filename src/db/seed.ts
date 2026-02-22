import { config } from "dotenv";
config({ path: ".env.local" });

async function seed() {
    console.log("Loading modules...");
    const { seedDatabase } = await import("./seed-data");

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL не знайдено");
    }

    console.log("Seeding started...");
    await seedDatabase();
}

seed().catch(console.error).finally(() => process.exit(0))
