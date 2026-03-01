import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectColumns, projectTasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

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
        const columnId = parseInt(id)

        // Delete all tasks in this column first (or it might have foreign key constraint)
        await db.delete(projectTasks).where(eq(projectTasks.columnId, columnId))

        // Delete the column
        await db.delete(projectColumns).where(eq(projectColumns.id, columnId))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete column" }, { status: 500 })
    }
}
