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

    // Authorization check
    const task = await db.query.projectTasks.findFirst({
        where: eq(projectTasks.id, taskId),
    })

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const isAdmin = (session.user as any).role === "admin"
    const updatePayload: Record<string, any> = {
        ...data,
        updatedAt: new Date()
    }

    // Security: Non-admin users cannot alter targetRoleIds or assign tasks to other students
    if (!isAdmin) {
        delete updatePayload.targetRoleIds
        if (task.creatorId === session.user.id) {
            updatePayload.assigneeId = session.user.id
        } else {
            delete updatePayload.assigneeId
        }
    }

    try {
        await db.update(projectTasks).set(updatePayload).where(eq(projectTasks.id, taskId))
        const updatedTask = (await db.select().from(projectTasks).where(eq(projectTasks.id, taskId)))[0]

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
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const taskId = parseInt(id)
        const task = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId),
        })

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        const isAdmin = (session.user as any).role === "admin"
        const isCreator = task.creatorId === session.user.id

        if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: "Forbidden: Only admin or the task creator can delete this task" }, { status: 403 })
        }

        await db.delete(projectTasks).where(eq(projectTasks.id, taskId))
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
    }
}
