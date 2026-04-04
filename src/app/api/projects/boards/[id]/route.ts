import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectBoardRoles, projectBoardUsers } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const boardId = parseInt(id)

        const board = await db.query.projectBoards.findFirst({
            where: eq(projectBoards.id, boardId),
            with: {
                allowedRoles: true,
                allowedUsers: true,
            }
        })

        if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 })
        return NextResponse.json(board)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
    }
}

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
        const { title, description, allowedRoleIds, allowedUserIds } = await req.json()

        await db.update(projectBoards).set({
                title,
                description,
            }).where(eq(projectBoards.id, boardId))

        // Update Access Restrictions
        await db.delete(projectBoardRoles).where(eq(projectBoardRoles.boardId, boardId))
        if (allowedRoleIds && allowedRoleIds.length > 0) {
            await db.insert(projectBoardRoles).values(
                allowedRoleIds.map((roleId: number) => ({
                    boardId,
                    roleId,
                }))
            )
        }

        await db.delete(projectBoardUsers).where(eq(projectBoardUsers.boardId, boardId))
        if (allowedUserIds && allowedUserIds.length > 0) {
            await db.insert(projectBoardUsers).values(
                allowedUserIds.map((userId: string) => ({
                    boardId,
                    userId,
                }))
            )
        }

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
