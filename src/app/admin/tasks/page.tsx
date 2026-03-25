export const dynamic = "force-dynamic"

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
        successRate: sql<number>`COALESCE(CAST(COUNT(CASE WHEN ${results.status} = 'passed' THEN 1 END) * 100.0 / NULLIF(COUNT(${results.id}), 0) AS SIGNED), 0)`
    })
        .from(tasks)
        .leftJoin(tracks, eq(tasks.trackId, tracks.id))
        .leftJoin(results, eq(tasks.id, results.taskId))
        .groupBy(
            tasks.id, 
            tasks.title, 
            tasks.description, 
            tasks.initialCode, 
            tasks.trackId, 
            tracks.title, 
            tasks.difficulty, 
            tasks.isActive, 
            tasks.order, 
            tracks.order
        )
        .orderBy(asc(tracks.order), asc(tasks.order))

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))

    return <TasksClient initialTasks={allTasks} tracks={allTracks} />
}
