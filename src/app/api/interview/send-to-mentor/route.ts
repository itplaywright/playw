import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { type, title, score, details, candidateNotes, sessionId, roleLevel } = body

        const candidateName = session.user.name || session.user.email || "Candidate"
        const candidateEmail = session.user.email || "No email"

        const numScore = Number(score) || 0
        const currentRoleLevel = roleLevel || "junior"

        // 1. Save or Update in database (interviewSessions table)
        if (type === "coding_challenge") {
            const newSessionId = `coding_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
            await db.insert(interviewSessions).values({
                id: newSessionId,
                userId: session.user.id,
                roleLevel: currentRoleLevel,
                stack: "typescript",
                status: "pending_review",
                totalScore: numScore,
                feedback: {
                    type: "coding_challenge",
                    challengeTitle: title,
                    code: details,
                    candidateNotes: candidateNotes || "",
                    mentorStatus: "pending",
                    readinessLevel: numScore >= 70 ? "PASSED (Lead Review)" : "REVISION REQUIRED"
                } as any
            })
        } else {
            // Technical interview 5-questions report
            const targetSessionId = sessionId || `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

            const existing = sessionId
                ? await db.query.interviewSessions.findFirst({
                    where: eq(interviewSessions.id, sessionId)
                })
                : null

            if (existing) {
                await db.update(interviewSessions)
                    .set({
                        status: "pending_review",
                        feedback: {
                            ...(existing.feedback || {}),
                            type: "interview_report",
                            candidateNotes: candidateNotes || "",
                            mentorStatus: "pending"
                        } as any
                    })
                    .where(eq(interviewSessions.id, sessionId))
            } else {
                await db.insert(interviewSessions).values({
                    id: targetSessionId,
                    userId: session.user.id,
                    roleLevel: currentRoleLevel,
                    stack: "typescript",
                    status: "pending_review",
                    totalScore: numScore,
                    feedback: {
                        type: "interview_report",
                        readinessLevel: details?.readinessLevel || "Assessed",
                        summaryEn: details?.summaryEn || "",
                        summaryUk: details?.summaryUk || "",
                        strengths: details?.strengths || [],
                        improvements: details?.improvements || [],
                        candidateNotes: candidateNotes || "",
                        mentorStatus: "pending"
                    } as any
                })
            }
        }

        // 2. Send Telegram notification if configured
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

        if (botToken && chatId) {
            let message = ""
            if (type === "coding_challenge") {
                message =
                    `💻 *Новий розв'язок лайв-кодингу на перевірку!*\n\n` +
                    `👤 *Кандидат:* ${candidateName} (${candidateEmail})\n` +
                    `🎯 *Завдання:* ${title}\n` +
                    `📊 *Попередня оцінка Lead QA:* ${numScore}/100\n`

                if (candidateNotes) {
                    message += `💬 *Коментар студента:* ${candidateNotes}\n`
                }

                if (details) {
                    const snippet = details.length > 400 ? details.slice(0, 400) + "\n...[truncated]" : details
                    message += `\n📝 *Код:*\n\`\`\`typescript\n${snippet}\n\`\`\`\n`
                }
            } else {
                message =
                    `🎙️ *Новий результат співбесіди на перевірку!*\n\n` +
                    `👤 *Кандидат:* ${candidateName} (${candidateEmail})\n` +
                    `🎯 *Грейд:* ${title}\n` +
                    `📊 *Загальний бал:* ${numScore}/100\n`

                if (details?.readinessLevel) {
                    message += `🏆 *Рівень готовності:* ${details.readinessLevel}\n`
                }
                if (candidateNotes) {
                    message += `💬 *Коментар студента:* ${candidateNotes}\n`
                }
            }

            message += `\n🔗 [Відкрити чергу перевірки](https://itplatform-three.vercel.app/admin/submissions)`

            try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: "Markdown"
                    })
                })
            } catch (tgError) {
                console.error("Failed to send Telegram notification:", tgError)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Successfully submitted to mentor and saved in database"
        })
    } catch (error: any) {
        console.error("Send to mentor API error:", error)
        return NextResponse.json({ error: error.message || "Failed to send to mentor" }, { status: 500 })
    }
}
