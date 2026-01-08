
import { db } from "@/db"
import { tracks } from "@/db/schema"
import { asc } from "drizzle-orm"
import TaskEditor from "@/components/admin/TaskEditor"

export default async function NewTaskPage() {
    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))

    return <TaskEditor tracks={allTracks} />
}
