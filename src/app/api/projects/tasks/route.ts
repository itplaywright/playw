
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectTasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const boardId = searchParams.get("boardId")

    if (!boardId) {
        return NextResponse.json({ error: "Board ID is required" }, { status: 400 })
    }

    const tasks = await db.query.projectTasks.findMany({
        where: eq(projectTasks.boardId, parseInt(boardId)),
        with: {
            assignee: true,
            creator: true,
        },
    })

    return NextResponse.json(tasks)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await req.json()
        const [newTask] = await db.insert(projectTasks).values({
            ...data,
            creatorId: session.user.id,
        }).returning()

        return NextResponse.json(newTask)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
}
