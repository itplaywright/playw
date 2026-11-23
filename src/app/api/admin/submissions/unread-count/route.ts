import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, projectSubmissions, interviewSessions } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, count } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [taskResult] = await db.select({ value: count() })
            .from(taskSubmissions)
            .where(eq(taskSubmissions.status, "pending"))

        const [projResult] = await db.select({ value: count() })
            .from(projectSubmissions)
            .where(eq(projectSubmissions.status, "pending"))

        const [interviewResult] = await db.select({ value: count() })
            .from(interviewSessions)
            .where(eq(interviewSessions.status, "pending_review"))

        const totalPending = (taskResult?.value || 0) + (projResult?.value || 0) + (interviewResult?.value || 0)

        return NextResponse.json({ count: totalPending })
    } catch (error) {
        console.error("Fetch submissions count error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
