
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, users, taskQuestions } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import TaskView from "@/components/task/TaskView"
import AdBlock from "@/components/ads/AdBlock"
import { checkHasAccess } from "@/lib/access"

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/")

    // Check free trial / subscription access
    const userRecord = await db.query.users.findFirst({ where: eq(users.id, session.user.id!) })
    const hasAccess = await checkHasAccess(
        session.user.id!,
        (session.user as any).role,
        userRecord?.createdAt ?? null
    )
    if (!hasAccess) redirect("/pricing")

    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.id)
    if (isNaN(taskId)) notFound()

    const task = (await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    })) as any;

    if (task) {
        task.taskQuestions = await db.select().from(taskQuestions)
            .where(eq(taskQuestions.taskId, taskId))
            .orderBy(asc(taskQuestions.order));
    }

    if (!task) notFound()

    // Access control: non-admins cannot see inactive tasks or tasks in inactive tracks
    if ((session.user as any).role !== "admin") {
        if (!task.isActive) notFound()

        if (task.trackId) {
            const track = await db.query.tracks.findFirst({
                where: eq(tracks.id, task.trackId)
            })
            if (!track || !track.isActive) notFound()
        }
    }

    const isProduction = process.env.NODE_ENV === "production"

    // Find next task in the same track
    let nextTaskData = null
    if (task.trackId) {
        const nextTask = await db.query.tasks.findFirst({
            where: (t, { and, eq, gt }) => and(
                eq(t.trackId, task.trackId),
                gt(t.order, task.order),
                eq(t.isActive, true)
            ),
            orderBy: (t, { asc }) => [asc(t.order)],
            columns: { id: true, title: true }
        })
        if (nextTask) nextTaskData = nextTask
    }

    return (
        <div>
            <AdBlock placement="task" position="before" />
            <TaskView task={task} isProduction={isProduction} nextTask={nextTaskData} />
            <AdBlock placement="task" position="after" />
        </div>
    )
}
