import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, and, or, ne } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const unreadSubmissions = await db.select({
            id: taskSubmissions.id,
            status: taskSubmissions.status,
            taskId: taskSubmissions.taskId,
            taskTitle: tasks.title,
            reviewedAt: taskSubmissions.reviewedAt
        })
        .from(taskSubmissions)
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .where(
            and(
                eq(taskSubmissions.userId, session.user.id!),
                eq(taskSubmissions.isSeen, false),
                or(
                    eq(taskSubmissions.status, "reviewed"),
                    eq(taskSubmissions.status, "rejected")
                )
            )
        )

        return NextResponse.json(unreadSubmissions)
    } catch (error) {
        console.error("Fetch notifications error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { submissionId } = await req.json()
        if (!submissionId) {
            return NextResponse.json({ error: "Missing submissionId" }, { status: 400 })
        }

        await db.update(taskSubmissions)
            .set({ isSeen: true })
            .where(
                and(
                    eq(taskSubmissions.id, submissionId),
                    eq(taskSubmissions.userId, session.user.id!)
                )
            )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Mark as seen error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
