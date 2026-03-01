
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectColumns } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, description } = await req.json()

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const [newBoard] = await db.insert(projectBoards).values({
            title,
            description,
        }).returning()

        const defaultColumns = [
            { title: "To Do", order: 1, color: "#94a3b8", boardId: newBoard.id },
            { title: "In Progress", order: 2, color: "#3b82f6", boardId: newBoard.id },
            { title: "Review", order: 3, color: "#eab308", boardId: newBoard.id },
            { title: "Done", order: 4, color: "#22c55e", boardId: newBoard.id },
        ]

        await db.insert(projectColumns).values(defaultColumns)

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

    const boards = await db.query.projectBoards.findMany({
        orderBy: (boards, { desc }) => [desc(boards.createdAt)],
    })

    return NextResponse.json(boards)
}
