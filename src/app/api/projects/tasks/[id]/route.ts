
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectTasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id)
    const data = await req.json()

    // Authorization check: Only admin or the assignee can update the task
    const task = await db.query.projectTasks.findFirst({
        where: eq(projectTasks.id, taskId),
    })

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Any authenticated user can currently update tasks (move across columns, etc.)
    // In a more complex system, we would check project membership here.

    try {
        const [updatedTask] = await db.update(projectTasks)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(projectTasks.id, taskId))
            .returning()

        return NextResponse.json(updatedTask)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
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
        await db.delete(projectTasks).where(eq(projectTasks.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
    }
}
