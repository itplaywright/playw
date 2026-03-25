import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const boardId = parseInt(id)
        const data = await req.json()

        await db.update(projectBoards).set({
                ...data,
            }).where(eq(projectBoards.id, boardId))
        const updatedBoard = (await db.select().from(projectBoards).where(eq(projectBoards.id, boardId)))[0]

        return NextResponse.json(updatedBoard)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const boardId = parseInt(id)

        await db.delete(projectBoards).where(eq(projectBoards.id, boardId))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }
}
