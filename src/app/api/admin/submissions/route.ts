import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, users, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const submissions = await db.select({
            id: taskSubmissions.id,
            code: taskSubmissions.code,
            status: taskSubmissions.status,
            mentorFeedback: taskSubmissions.mentorFeedback,
            createdAt: taskSubmissions.createdAt,
            userName: users.name,
            userEmail: users.email,
            taskTitle: tasks.title,
            taskId: tasks.id
        })
        .from(taskSubmissions)
        .innerJoin(users, eq(taskSubmissions.userId, users.id))
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .orderBy(desc(taskSubmissions.createdAt))

        return NextResponse.json(submissions)
    } catch (error) {
        console.error("Fetch submissions error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { submissionId, feedback, status } = await req.json()

        if (!submissionId || !feedback) {
            return NextResponse.json({ error: "Missing submissionId or feedback" }, { status: 400 })
        }

        await db.update(taskSubmissions)
            .set({ 
                mentorFeedback: feedback, 
                status: status || "reviewed",
                reviewedAt: new Date(),
                isSeen: false
            })
            .where(eq(taskSubmissions.id, submissionId))

        // Get details to send email and telegram
        const submissionWithUser = await db.select({
            userEmail: users.email,
            userName: users.firstName,
            backupName: users.name,
            taskTitle: tasks.title,
            telegramChatId: users.telegramChatId,
        })
        .from(taskSubmissions)
        .innerJoin(users, eq(taskSubmissions.userId, users.id))
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .where(eq(taskSubmissions.id, submissionId))
        .then(res => res[0])

        if (submissionWithUser) {
            const finalStatus = status || "reviewed";
            const name = submissionWithUser.userName || submissionWithUser.backupName || "Студент";
            
            // Send Email
            if (submissionWithUser.userEmail) {
                const { sendMentorFeedbackEmail } = await import("@/lib/email")
                // Do not block response on email sending
                sendMentorFeedbackEmail({
                    toEmail: submissionWithUser.userEmail,
                    userName: name,
                    taskTitle: submissionWithUser.taskTitle,
                    feedback,
                    status: finalStatus
                }).catch(console.error)
            }

            // Send Telegram Notification
            if (submissionWithUser.telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
                const isPassed = finalStatus === "reviewed"
                const emoji = isPassed ? "✅" : "⚠️"
                const statusText = isPassed ? "Успішно складено" : "Потребує доопрацювання"
                
                const tgMessage = `Привіт, ${name}! 👋\n\n` +
                    `Ваше виконання завдання *"${submissionWithUser.taskTitle}"* перевірено ментором.\n\n` +
                    `Статус: ${emoji} *${statusText}*\n\n` +
                    `📝 Відгук:\n_${feedback}_\n\n` +
                    `[Увійдіть на платформу](https://itplatform-three.vercel.app/dashboard)`

                fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: submissionWithUser.telegramChatId,
                        text: tgMessage,
                        parse_mode: "Markdown"
                    })
                }).catch(e => console.error("Failed to send telegram mentor feedback:", e))
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update submission error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
