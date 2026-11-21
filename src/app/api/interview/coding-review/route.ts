import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { evaluateCodingChallenge } from "@/lib/interviewAI"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { challengeTitle, challengeGoal, initialBuggyCode, studentCode } = body

        if (!challengeTitle || !studentCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const evaluation = await evaluateCodingChallenge(
            challengeTitle,
            challengeGoal || "",
            initialBuggyCode || "",
            studentCode
        )

        return NextResponse.json({ evaluation })
    } catch (error: any) {
        console.error("Coding challenge review API error:", error)
        return NextResponse.json({ error: error.message || "Evaluation failed" }, { status: 500 })
    }
}
