import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, tasks, tracks, results, users, roles, projectBoardRoles, projectBoardUsers } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, desc, asc, or, and, isNull, inArray } from "drizzle-orm"
import ProjectsClient from "@/components/projects/ProjectsClient"
import { checkHasAccess } from "@/lib/access"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const userWithRole = (await db.select({
        id: users.id,
        createdAt: users.createdAt,
        dynamicRole: {
            id: roles.id,
            name: roles.name,
            maxTrackOrder: roles.maxTrackOrder,
            hasPracticeAccess: roles.hasPracticeAccess,
        }
    })
        .from(users)
        .leftJoin(roles, eq(users.dynamicRoleId, roles.id))
        .where(eq(users.id, session.user.id!)))[0] as any;

    // Check free trial / subscription access
    const hasAccess = await checkHasAccess(
        session.user.id!,
        (session.user as any).role,
        userWithRole?.createdAt ?? null
    )
    if (!hasAccess) redirect("/pricing")

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))
    const allTasks = await db.select().from(tasks).orderBy(asc(tasks.order))
    const userResults = await db.select().from(results).where(eq(results.userId, session.user.id!))
    
    const isAdmin = (session.user as any).role === "admin"
    const userRoleId = userWithRole?.dynamicRole?.id

    // Fetch boards with access control
    let boards;
    if (isAdmin) {
        boards = await db.select().from(projectBoards).orderBy(desc(projectBoards.createdAt))
    } else {
        // Boards matching user's role OR specifically assigned to user
        const boardsByRoleQuery = db.select({ id: projectBoardRoles.boardId })
            .from(projectBoardRoles)
            .where(userRoleId ? eq(projectBoardRoles.roleId, userRoleId) : undefined);
            
        const boardsByUserQuery = db.select({ id: projectBoardUsers.boardId })
            .from(projectBoardUsers)
            .where(eq(projectBoardUsers.userId, session.user.id!));

        // Get the actual boards
        boards = await db.select()
            .from(projectBoards)
            .where(
                or(
                    inArray(projectBoards.id, boardsByRoleQuery),
                    inArray(projectBoards.id, boardsByUserQuery)
                )
            )
            .orderBy(desc(projectBoards.createdAt));
    }
    const visibleTracks = isAdmin ? allTracks : allTracks.filter(t => t.isActive)
    const visibleTasks = isAdmin ? allTasks : allTasks.filter(t => t.isActive)

    // Pre-compute status map
    const statusMap: Record<number, "Виконано" | "В процесі" | "Не розпочато"> = {}
    for (const task of visibleTasks) {
        const taskResults = userResults.filter(r => r.taskId === task.id)
        if (taskResults.some(r => r.status === 'passed')) {
            statusMap[task.id] = "Виконано"
        } else if (taskResults.length > 0) {
            statusMap[task.id] = "В процесі"
        } else {
            statusMap[task.id] = "Не розпочато"
        }
    }

    const allRoles = await db.select().from(roles).orderBy(asc(roles.name))
    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(asc(users.name))

    return (
        <ProjectsClient
            initialBoards={boards as any}
            isAdmin={isAdmin}
            tracks={visibleTracks as any}
            tasks={visibleTasks as any}
            statusMap={statusMap}
            userName={session.user.name}
            userImage={session.user.image}
            role={userWithRole?.dynamicRole}
            allRoles={allRoles as any}
            allUsers={allUsers as any}
        />
    )
}
