
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectTasks, users as usersTable } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, and, asc } from "drizzle-orm"

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

    const tasks = await db.select({
        id: projectTasks.id,
        boardId: projectTasks.boardId,
        columnId: projectTasks.columnId,
        title: projectTasks.title,
        description: projectTasks.description,
        assigneeId: projectTasks.assigneeId,
        creatorId: projectTasks.creatorId,
        status: projectTasks.status,
        priority: projectTasks.priority,
        order: projectTasks.order,
        createdAt: projectTasks.createdAt,
        updatedAt: projectTasks.updatedAt,
        assignee: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
        }
    })
        .from(projectTasks)
        .leftJoin(usersTable, eq(projectTasks.assigneeId, usersTable.id))
        .where(eq(projectTasks.boardId, parseInt(boardId)))
        .orderBy(asc(projectTasks.order))

    return NextResponse.json(tasks)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await req.json()
        const [__ir4] = await db.insert(projectTasks).values({
            ...data,
            creatorId: session.user.id,
        })
        const newTask = (await db.select().from(projectTasks).where(eq(projectTasks.id, __ir4.insertId)))[0]

        return NextResponse.json(newTask)
    } catch (error) {
        console.error("Failed to create task:", error)
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
}
