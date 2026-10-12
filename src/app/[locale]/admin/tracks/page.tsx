export const dynamic = "force-dynamic"

import { db } from "@/db"
import { tracks, tasks } from "@/db/schema"
import { count, eq, asc } from "drizzle-orm"
import TracksClient from "@/components/admin/TracksClient"

export default async function AdminTracksPage() {
    const allTracks = await db.select({
        id: tracks.id,
        title: tracks.title,
        titleEn: tracks.titleEn,
        titleRu: tracks.titleRu,
        description: tracks.description,
        descriptionEn: tracks.descriptionEn,
        descriptionRu: tracks.descriptionRu,
        isActive: tracks.isActive,
        order: tracks.order,
        taskCount: count(tasks.id)
    })
        .from(tracks)
        .leftJoin(tasks, eq(tracks.id, tasks.trackId))
        .groupBy(
            tracks.id,
            tracks.title,
            tracks.titleEn,
            tracks.titleRu,
            tracks.description,
            tracks.descriptionEn,
            tracks.descriptionRu,
            tracks.isActive,
            tracks.order
        )
        .orderBy(asc(tracks.order))

    return <TracksClient initialTracks={allTracks} />
}
