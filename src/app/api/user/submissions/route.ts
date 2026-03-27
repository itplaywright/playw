import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const submissions = await db.select({
            id: taskSubmissions.id,
            taskId: taskSubmissions.taskId,
            taskTitle: tasks.title,
            code: taskSubmissions.code,
            mentorFeedback: taskSubmissions.mentorFeedback,
            status: taskSubmissions.status,
            createdAt: taskSubmissions.createdAt,
            reviewedAt: taskSubmissions.reviewedAt
        })
        .from(taskSubmissions)
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .where(eq(taskSubmissions.userId, session.user.id))
        .orderBy(desc(taskSubmissions.createdAt))

        return NextResponse.json(submissions)
    } catch (error) {
        console.error("Fetch submissions error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
