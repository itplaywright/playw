import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, tasks, tracks, results, users } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, desc, asc } from "drizzle-orm"
import ProjectsClient from "@/components/projects/ProjectsClient"
import { checkHasAccess } from "@/lib/access"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const userWithRole = await db.query.users.findFirst({
        where: eq(users.id, session.user.id!),
        with: {
            dynamicRole: true
        }
    })

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
    const boards = await db.select().from(projectBoards).orderBy(desc(projectBoards.createdAt))

    const isAdmin = (session.user as any).role === "admin"
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
        />
    )
}
