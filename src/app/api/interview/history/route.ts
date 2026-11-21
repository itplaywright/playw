import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const history = await db
            .select()
            .from(interviewSessions)
            .where(eq(interviewSessions.userId, session.user.id))
            .orderBy(desc(interviewSessions.createdAt))
            .limit(10)

        return NextResponse.json({ history })
    } catch (error: any) {
        console.error("Error fetching interview history:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 })
    }
}
