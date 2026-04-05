import { db } from "./src/db"
import { users, roles } from "./src/db/schema"
import { eq } from "drizzle-orm"

async function debug() {
  const all = await db.select({
    userId: users.id,
    email: users.email,
    roleId: users.dynamicRoleId,
    roleName: roles.name
  })
  .from(users)
  .leftJoin(roles, eq(users.dynamicRoleId, roles.id))
  .limit(20)

  console.log("DEBUG_USERS_ROLES:", JSON.stringify(all, null, 2))
}

debug()
