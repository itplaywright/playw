
import { db } from "@/db"
import { tracks, tasks } from "@/db/schema"
import { count, eq, asc } from "drizzle-orm"
import TracksClient from "@/components/admin/TracksClient"

export default async function AdminTracksPage() {
    const allTracks = await db.select({
        id: tracks.id,
        title: tracks.title,
        description: tracks.description,
        isActive: tracks.isActive,
        order: tracks.order,
        taskCount: count(tasks.id)
    })
        .from(tracks)
        .leftJoin(tasks, eq(tracks.id, tasks.trackId))
        .groupBy(tracks.id)
        .orderBy(asc(tracks.order))

    return <TracksClient initialTracks={allTracks} />
}
