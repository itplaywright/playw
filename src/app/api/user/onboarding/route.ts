import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { learningPath } = body

        if (!["theory", "practice"].includes(learningPath)) {
            return new NextResponse("Invalid learning path", { status: 400 })
        }

        await db.update(users)
            .set({
                learningPath: learningPath as "theory" | "practice",
                onboardingCompleted: true
            })
            .where(eq(users.id, session.user.id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Onboarding error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
