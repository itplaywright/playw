import { db } from "@/db"
import { users, results, roles, tasks } from "@/db/schema"
import { count, eq, sql, desc, asc } from "drizzle-orm"
import UsersClient from "@/components/admin/UsersClient"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        image: users.image,
        phone: users.phone,
        telegram: users.telegram,
        whatsapp: users.whatsapp,
        learningPath: users.learningPath,
        programmingLanguage: users.programmingLanguage,
        role: users.role,
        dynamicRoleId: users.dynamicRoleId,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        passedTasks: sql<number>`(SELECT COUNT(DISTINCT ${results.taskId}) FROM ${results} WHERE ${results.userId} = ${users.id} AND ${results.status} = 'passed')`
    })
        .from(users)
        .orderBy(desc(users.createdAt))

    const allRoles = await db.select().from(roles).orderBy(asc(roles.name))
    const totalTasksCount = await db.select({ count: count() }).from(tasks).then(r => r[0]?.count || 0)

    return <UsersClient initialUsers={allUsers} roles={allRoles} totalTasks={totalTasksCount} />
}
