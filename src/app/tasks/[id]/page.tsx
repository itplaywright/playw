
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import TaskView from "@/components/task/TaskView"
import AdBlock from "@/components/ads/AdBlock"

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/")

    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.id)
    if (isNaN(taskId)) notFound()

    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    })

    if (!task) notFound()

    const isProduction = process.env.NODE_ENV === "production"

    return (
        <div>
            <AdBlock placement="task" position="before" />
            <TaskView task={task} isProduction={isProduction} />
            <AdBlock placement="task" position="after" />
        </div>
    )
}
