import { config } from "dotenv"
import { seedDatabase } from "@/db/seed-data"

config({ path: ".env.local" })

async function seed() {
    // Dynamic import to ensure process.env.DATABASE_URL is loaded before DB connection is initialized
    await import("@/db")

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL не знайдено")
    }

    await seedDatabase()
}

seed().catch(console.error).finally(() => process.exit(0))
