import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions, interviewQuestions } from "@/db/schema"
import { evaluateStudentAnswer, generateFinalInterviewReport } from "@/lib/interviewAI"
import { eq, and, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { sessionId, questionOrder, studentAnswer } = await req.json()

        if (!sessionId || !questionOrder) {
            return NextResponse.json({ error: "Missing sessionId or questionOrder" }, { status: 400 })
        }

        // Verify session belongs to user
        const [currentSession] = await db
            .select()
            .from(interviewSessions)
            .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, session.user.id)))
            .limit(1)

        if (!currentSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Find the current question
        const [currentQuestion] = await db
            .select()
            .from(interviewQuestions)
            .where(and(eq(interviewQuestions.sessionId, sessionId), eq(interviewQuestions.questionOrder, questionOrder)))
            .limit(1)

        if (!currentQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 })
        }

        // 1. AI Evaluate this answer
        const evaluation = await evaluateStudentAnswer(
            currentQuestion.questionEn,
            studentAnswer || "",
            currentSession.roleLevel,
            currentQuestion.idealAnswerEn || undefined
        )

        // 2. Update question in DB
        await db
            .update(interviewQuestions)
            .set({
                studentAnswer: studentAnswer || "",
                score: evaluation.score,
                aiEvaluation: {
                    evaluationEn: evaluation.evaluationEn,
                    evaluationUk: evaluation.evaluationUk,
                    evaluationRu: evaluation.evaluationRu,
                    mistakesEn: evaluation.mistakesEn,
                    mistakesUk: evaluation.mistakesUk,
                    mistakesRu: evaluation.mistakesRu,
                },
                idealAnswerEn: evaluation.idealAnswerEn || currentQuestion.idealAnswerEn,
                idealAnswerUk: evaluation.idealAnswerUk || currentQuestion.idealAnswerUk,
                idealAnswerRu: evaluation.idealAnswerRu || currentQuestion.idealAnswerRu,
            })
            .where(eq(interviewQuestions.id, currentQuestion.id))

        // 3. Check for next question
        const [nextQuestion] = await db
            .select()
            .from(interviewQuestions)
            .where(and(eq(interviewQuestions.sessionId, sessionId), eq(interviewQuestions.questionOrder, questionOrder + 1)))
            .limit(1)

        if (nextQuestion) {
            return NextResponse.json({
                isFinished: false,
                evaluation: {
                    score: evaluation.score,
                    evaluationEn: evaluation.evaluationEn,
                    evaluationUk: evaluation.evaluationUk,
                    evaluationRu: evaluation.evaluationRu,
                    mistakesEn: evaluation.mistakesEn,
                    mistakesUk: evaluation.mistakesUk,
                    mistakesRu: evaluation.mistakesRu,
                    idealAnswerEn: evaluation.idealAnswerEn || currentQuestion.idealAnswerEn,
                    idealAnswerUk: evaluation.idealAnswerUk || currentQuestion.idealAnswerUk,
                    idealAnswerRu: evaluation.idealAnswerRu || currentQuestion.idealAnswerRu,
                },
                nextQuestion: {
                    order: nextQuestion.questionOrder,
                    category: nextQuestion.category,
                    questionEn: nextQuestion.questionEn,
                    questionUk: nextQuestion.questionUk,
                    questionRu: nextQuestion.questionRu,
                }
            })
        }

        // 4. All questions answered! Generate Final Report
        const allQuestions = await db
            .select()
            .from(interviewQuestions)
            .where(eq(interviewQuestions.sessionId, sessionId))
            .orderBy(asc(interviewQuestions.questionOrder))

        const finalReport = await generateFinalInterviewReport(
            currentSession.roleLevel,
            allQuestions.map(q => ({
                questionEn: q.questionEn,
                studentAnswer: q.id === currentQuestion.id ? (studentAnswer || "") : (q.studentAnswer || ""),
                score: q.id === currentQuestion.id ? evaluation.score : (q.score || 0),
                evaluationEn: q.id === currentQuestion.id ? evaluation.evaluationEn : (q.aiEvaluation?.evaluationEn || "")
            }))
        )

        // 5. Update session status
        await db
            .update(interviewSessions)
            .set({
                status: 'completed',
                totalScore: finalReport.totalScore,
                feedback: {
                    readinessLevel: finalReport.readinessLevel,
                    summaryEn: finalReport.summaryEn,
                    summaryUk: finalReport.summaryUk,
                    summaryRu: finalReport.summaryRu,
                    strengths: finalReport.strengths,
                    improvements: finalReport.improvements,
                }
            })
            .where(eq(interviewSessions.id, sessionId))

        return NextResponse.json({
            isFinished: true,
            evaluation: {
                score: evaluation.score,
                evaluationEn: evaluation.evaluationEn,
                evaluationUk: evaluation.evaluationUk,
                evaluationRu: evaluation.evaluationRu,
                mistakesEn: evaluation.mistakesEn,
                mistakesUk: evaluation.mistakesUk,
                mistakesRu: evaluation.mistakesRu,
                idealAnswerEn: evaluation.idealAnswerEn || currentQuestion.idealAnswerEn,
                idealAnswerUk: evaluation.idealAnswerUk || currentQuestion.idealAnswerUk,
                idealAnswerRu: evaluation.idealAnswerRu || currentQuestion.idealAnswerRu,
            },
            finalReport,
            allQuestions: allQuestions.map(q => ({
                order: q.questionOrder,
                category: q.category,
                questionEn: q.questionEn,
                questionUk: q.questionUk,
                questionRu: q.questionRu,
                studentAnswer: q.id === currentQuestion.id ? (studentAnswer || "") : q.studentAnswer,
                score: q.id === currentQuestion.id ? evaluation.score : q.score,
                evaluation: q.id === currentQuestion.id ? evaluation : q.aiEvaluation,
                idealAnswerEn: q.id === currentQuestion.id ? (evaluation.idealAnswerEn || currentQuestion.idealAnswerEn) : q.idealAnswerEn,
                idealAnswerUk: q.id === currentQuestion.id ? (evaluation.idealAnswerUk || currentQuestion.idealAnswerUk) : q.idealAnswerUk,
                idealAnswerRu: q.id === currentQuestion.id ? (evaluation.idealAnswerRu || currentQuestion.idealAnswerRu) : q.idealAnswerRu,
            }))
        })
    } catch (error: any) {
        console.error("Error processing interview answer:", error)
        return NextResponse.json({ error: error.message || "Failed to process answer" }, { status: 500 })
    }
}
