import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { type, title, score, details, candidateNotes } = body

        const candidateName = session.user.name || session.user.email || "Candidate"
        const candidateEmail = session.user.email || "No email"

        // Send Telegram notification if configured
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

        if (botToken && chatId) {
            let message = ""
            if (type === "coding_challenge") {
                message =
                    `💻 *Новий розв'язок лайв-кодингу на перевірку!*\n\n` +
                    `👤 *Кандидат:* ${candidateName} (${candidateEmail})\n` +
                    `🎯 *Завдання:* ${title}\n` +
                    `📊 *Попередня оцінка Lead QA:* ${score}/100\n`
                
                if (candidateNotes) {
                    message += `💬 *Коментар студента:* ${candidateNotes}\n`
                }
                
                if (details) {
                    // Truncate code snippet if too long
                    const snippet = details.length > 500 ? details.slice(0, 500) + "\n...[truncated]" : details
                    message += `\n📝 *Код:*\n\`\`\`typescript\n${snippet}\n\`\`\`\n`
                }
            } else {
                message =
                    `🎙️ *Новий результат співбесіди на перевірку!*\n\n` +
                    `👤 *Кандидат:* ${candidateName} (${candidateEmail})\n` +
                    `🎯 *Грейд:* ${title}\n` +
                    `📊 *Загальний бал:* ${score}/100\n`
                
                if (details?.readinessLevel) {
                    message += `🏆 *Рівень готовності:* ${details.readinessLevel}\n`
                }
                if (candidateNotes) {
                    message += `💬 *Коментар студента:* ${candidateNotes}\n`
                }
            }

            message += `\n🔗 [Відкрити платформу](https://itplatform-three.vercel.app/admin)`

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
            message: "Successfully submitted to mentor"
        })
    } catch (error: any) {
        console.error("Send to mentor API error:", error)
        return NextResponse.json({ error: error.message || "Failed to send to mentor" }, { status: 500 })
    }
}
