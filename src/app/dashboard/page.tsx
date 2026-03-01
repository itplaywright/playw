
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, results } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import DashboardClient from "@/components/dashboard/DashboardClient"

export default async function Dashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (!(session.user as any).onboardingCompleted) {
        redirect("/onboarding")
    }

    const allTracks = await db.select().from(tracks).orderBy(tracks.order)
    const allTasks = await db.select().from(tasks).orderBy(tasks.order)
    const userResults = await db.select().from(results).where(eq(results.userId, session.user.id!))

    const isAdmin = (session.user as any).role === "admin"

    const visibleTracks = isAdmin ? allTracks : allTracks.filter(t => t.isActive)
    const visibleTasks = isAdmin ? allTasks : allTasks.filter(t => t.isActive)

    // Pre-compute status map for all tasks
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
        <DashboardClient
            tracks={visibleTracks as any}
            tasks={visibleTasks as any}
            statusMap={statusMap}
            isAdmin={isAdmin}
        />
    )
}
