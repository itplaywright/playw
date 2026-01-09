
import { db } from "@/db"
import { users } from "@/db/schema"
import { config } from "dotenv"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

config({ path: ".env.local" })

async function createAdmin() {
    // Dynamic import to ensure process.env.DATABASE_URL is loaded before DB connection is initialized
    const { db } = await import("@/db")
    const { users } = await import("@/db/schema")

    const email = "manual_test@demo.com"
    const password = "password123"
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`🔍 Checking if user ${email} exists...`)

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    })

    if (existingUser) {
        console.log(`👤 User exists. Updating password and role to ADMIN...`)
        await db.update(users)
            .set({
                role: "admin",
                passwordHash: hashedPassword // Reset password to ensure it is correct
            })
            .where(eq(users.email, email))
    } else {
        console.log(`👤 User does not exist. Creating new ADMIN user...`)
        await db.insert(users).values({
            name: "Admin Tester",
            email: email,
            passwordHash: hashedPassword,
            role: "admin",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        })
    }

    console.log("✅ SUCCESS! User ready:")
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
}

createAdmin().catch(console.error).finally(() => process.exit(0))
