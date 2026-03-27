import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, count } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [result] = await db.select({ value: count() })
            .from(taskSubmissions)
            .where(eq(taskSubmissions.status, "pending"))

        return NextResponse.json({ count: result.value })
    } catch (error) {
        console.error("Fetch submissions count error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
