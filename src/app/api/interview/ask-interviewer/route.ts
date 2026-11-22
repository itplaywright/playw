import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { askInterviewer } from "@/lib/interviewAI"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { challengeTitle, challengeGoal, candidateQuestion } = body

        if (!candidateQuestion || candidateQuestion.trim().length < 3) {
            return NextResponse.json({ error: "Question is too short" }, { status: 400 })
        }

        const response = await askInterviewer(
            challengeTitle || "Playwright Challenge",
            challengeGoal || "",
            candidateQuestion
        )

        return NextResponse.json({ response })
    } catch (error: any) {
        console.error("Ask interviewer API error:", error)
        return NextResponse.json({ error: error.message || "Failed to get interviewer answer" }, { status: 500 })
    }
}
