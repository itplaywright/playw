
import { db } from "@/db"
import { users, results } from "@/db/schema"
import { count, eq, sql, desc } from "drizzle-orm"
import UsersClient from "@/components/admin/UsersClient"

export default async function AdminUsersPage() {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        passedTasks: sql<number>`(SELECT COUNT(DISTINCT ${results.taskId}) FROM ${results} WHERE ${results.userId} = "user"."id" AND ${results.status} = 'passed')`
    })
        .from(users)
        .orderBy(desc(users.createdAt))

    return <UsersClient initialUsers={allUsers} />
}
