
import { db } from "@/db"
import { tasks, tracks } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import TaskEditor from "@/components/admin/TaskEditor"
import { notFound } from "next/navigation"

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.id)
    if (isNaN(taskId)) notFound()

    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    })

    if (!task) notFound()

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))

    return <TaskEditor initialData={task} tracks={allTracks} />
}
