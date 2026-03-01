
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectColumns } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const boards = await db.query.projectBoards.findMany({
        with: {
            columns: {
                orderBy: (columns, { asc }) => [asc(columns.order)],
            },
        },
    })

    return NextResponse.json(boards)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { title, description } = await req.json()

        const [newBoard] = await db.insert(projectBoards).values({
            title,
            description,
        }).returning()

        // Create default columns
        const defaultColumns = [
            { title: "To Do", order: 1, color: "#94a3b8", boardId: newBoard.id },
            { title: "In Progress", order: 2, color: "#3b82f6", boardId: newBoard.id },
            { title: "Review", order: 3, color: "#eab308", boardId: newBoard.id },
            { title: "Done", order: 4, color: "#22c55e", boardId: newBoard.id },
        ]

        await db.insert(projectColumns).values(defaultColumns)

        return NextResponse.json(newBoard)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create board" }, { status: 500 })
    }
}
