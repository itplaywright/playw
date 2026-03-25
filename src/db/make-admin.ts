
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { db } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"

async function makeAdmin(email: string) {
    console.log(`Призначення ролі ADMIN для ${email}...`)

    try {
        await db.update(users)
            .set({ role: "admin" })
            .where(eq(users.email, email))

        const result = await db.select().from(users).where(eq(users.email, email))

        if (result.length > 0) {
            console.log(`✅ Успішно! Користувач ${email} тепер адміністратор.`)
        } else {
            console.log(`❌ Помилка: Користувача з email ${email} не знайдено.`)
        }
    } catch (error) {
        console.error("Помилка при оновленні ролі:", error)
    }
}

const email = process.argv[2]
if (!email) {
    console.log("Будь ласка, вкажіть email: npx tsx src/db/make-admin.ts user@example.com")
    process.exit(1)
}

makeAdmin(email)
