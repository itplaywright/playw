import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectColumns } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { boardId, title, color } = await req.json()

        if (!boardId || !title) {
            return NextResponse.json({ error: "Board ID and title are required" }, { status: 400 })
        }

        // Get max order
        const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId))
        const maxOrder = columns.length > 0 ? Math.max(...columns.map(c => c.order || 0)) : 0

        const [newColumn] = await db.insert(projectColumns).values({
            boardId,
            title,
            color: color || "#94a3b8",
            order: maxOrder + 1,
        }).returning()

        return NextResponse.json(newColumn)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create column" }, { status: 500 })
    }
}
