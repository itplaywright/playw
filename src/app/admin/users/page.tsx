import { db } from "@/db"
import { users, results, roles } from "@/db/schema"
import { count, eq, sql, desc, asc } from "drizzle-orm"
import UsersClient from "@/components/admin/UsersClient"

export default async function AdminUsersPage() {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        dynamicRoleId: users.dynamicRoleId,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        passedTasks: sql<number>`(SELECT COUNT(DISTINCT ${results.taskId}) FROM ${results} WHERE ${results.userId} = "user"."id" AND ${results.status} = 'passed')`
    })
        .from(users)
        .orderBy(desc(users.createdAt))

    const allRoles = await db.select().from(roles).orderBy(asc(roles.name))

    return <UsersClient initialUsers={allUsers} roles={allRoles} />
}
