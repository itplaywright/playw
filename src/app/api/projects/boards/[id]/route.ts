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

        console.log(`[GET] Fetching board access. ID: ${id}, Parsed boardId: ${boardId}`)

        // Refactored to avoid JSON_ARRAYAGG (MySQL version compatibility)
        const boards = await db.select().from(projectBoards).where(eq(projectBoards.id, boardId))
        const board = boards[0]

        if (!board) {
            console.log(`[GET] Board not found for ID: ${boardId}`)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const allowedRoles = await db.select().from(projectBoardRoles).where(eq(projectBoardRoles.boardId, boardId))
        const allowedUsers = await db.select().from(projectBoardUsers).where(eq(projectBoardUsers.boardId, boardId))

        console.log(`[GET] Board: ${board.title}, Allowed Roles: ${allowedRoles.length}, Allowed Users: ${allowedUsers.length}`)

        return NextResponse.json({
            ...board,
            allowedRoles,
            allowedUsers,
        })
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

        // Update Access Restrictions: Delete and Re-insert
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
