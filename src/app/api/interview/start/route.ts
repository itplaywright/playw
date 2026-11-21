import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions, interviewQuestions } from "@/db/schema"
import { getQuestionsForLevel } from "@/lib/interviewBank"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        const roleLevel = (['junior', 'middle', 'senior'].includes(body.roleLevel) ? body.roleLevel : 'junior') as 'junior' | 'middle' | 'senior'
        const stack = body.stack || 'typescript'

        const sessionId = crypto.randomUUID()
        const selectedQuestions = getQuestionsForLevel(roleLevel, 5)

        // 1. Create session
        await db.insert(interviewSessions).values({
            id: sessionId,
            userId: session.user.id,
            roleLevel,
            stack,
            status: 'in_progress',
        })

        // 2. Insert questions
        for (let i = 0; i < selectedQuestions.length; i++) {
            const q = selectedQuestions[i]
            await db.insert(interviewQuestions).values({
                sessionId,
                questionOrder: i + 1,
                category: q.category,
                questionEn: q.questionEn,
                questionUk: q.questionUk,
                questionRu: q.questionRu,
                idealAnswerEn: q.idealAnswerEn,
                idealAnswerUk: q.idealAnswerUk,
                idealAnswerRu: q.idealAnswerRu,
            })
        }

        const firstQuestion = selectedQuestions[0]

        return NextResponse.json({
            sessionId,
            roleLevel,
            totalQuestions: selectedQuestions.length,
            currentQuestion: {
                order: 1,
                category: firstQuestion.category,
                questionEn: firstQuestion.questionEn,
                questionUk: firstQuestion.questionUk,
                questionRu: firstQuestion.questionRu,
            }
        })
    } catch (error: any) {
        console.error("Error starting interview session:", error)
        return NextResponse.json({ error: error.message || "Failed to start interview" }, { status: 500 })
    }
}
