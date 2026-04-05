
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectColumns, projectBoardRoles, projectBoardUsers } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, description, allowedRoleIds, allowedUserIds } = await req.json()

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const [__ir2] = await db.insert(projectBoards).values({
            title,
            description,
        })
        const newBoard = (await db.select().from(projectBoards).where(eq(projectBoards.id, __ir2.insertId)))[0]

        const defaultColumns = [
            { title: "To Do", order: 1, color: "#94a3b8", boardId: newBoard.id },
            { title: "In Progress", order: 2, color: "#3b82f6", boardId: newBoard.id },
            { title: "Review", order: 3, color: "#eab308", boardId: newBoard.id },
            { title: "Done", order: 4, color: "#22c55e", boardId: newBoard.id },
        ]

        await db.insert(projectColumns).values(defaultColumns)

        // Insert Access Restrictions
        if (allowedRoleIds && allowedRoleIds.length > 0) {
            await db.insert(projectBoardRoles).values(
                allowedRoleIds.map((roleId: number) => ({
                    boardId: newBoard.id,
                    roleId,
                }))
            )
        }

        if (allowedUserIds && allowedUserIds.length > 0) {
            await db.insert(projectBoardUsers).values(
                allowedUserIds.map((userId: string) => ({
                    boardId: newBoard.id,
                    userId,
                }))
            )
        }

        return NextResponse.json(newBoard)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }
}

export async function GET() {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const boards = await db.select().from(projectBoards).orderBy(desc(projectBoards.createdAt))

    return NextResponse.json(boards)
}
