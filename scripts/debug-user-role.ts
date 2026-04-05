import { db } from "./src/db"
import { users, roles } from "./src/db/schema"
import { eq } from "drizzle-orm"

async function check() {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        dynamicRoleId: users.dynamicRoleId,
        role: users.role
    }).from(users).limit(10)

    console.log("Users:", JSON.stringify(allUsers, null, 2))

    const allRoles = await db.select().from(roles)
    console.log("Roles:", JSON.stringify(allRoles, null, 2))
}

check()
