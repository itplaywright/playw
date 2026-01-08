
import { db } from "@/db"
import { tasks, tracks, results } from "@/db/schema"
import { count, eq, sql, asc } from "drizzle-orm"
import TasksClient from "@/components/admin/TasksClient"

export default async function AdminTasksPage() {
    const allTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        initialCode: tasks.initialCode,
        trackId: tasks.trackId,
        trackTitle: tracks.title,
        difficulty: tasks.difficulty,
        isActive: tasks.isActive,
        order: tasks.order,
        trackOrder: tracks.order,
        successRate: sql<number>`CAST(COUNT(CASE WHEN ${results.status} = 'passed' THEN 1 END) * 100.0 / NULLIF(COUNT(${results.id}), 0) AS INTEGER)`
    })
        .from(tasks)
        .leftJoin(tracks, eq(tasks.trackId, tracks.id))
        .leftJoin(results, eq(tasks.id, results.taskId))
        .groupBy(tasks.id, tracks.title, tracks.order, tasks.order)
        .orderBy(asc(tracks.order), asc(tasks.order))

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))

    return <TasksClient initialTasks={allTasks} tracks={allTracks} />
}
