import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, projectSubmissions, projectTasks, projectBoards, users, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc, sql } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Regular course task submissions
        const regularSubmissions = await db.select({
            id: taskSubmissions.id,
            code: taskSubmissions.code,
            status: taskSubmissions.status,
            mentorFeedback: taskSubmissions.mentorFeedback,
            createdAt: taskSubmissions.createdAt,
            userName: users.name,
            userEmail: users.email,
            taskTitle: tasks.title,
            taskId: tasks.id,
            isProject: sql<boolean>`false`
        })
        .from(taskSubmissions)
        .innerJoin(users, eq(taskSubmissions.userId, users.id))
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .orderBy(desc(taskSubmissions.createdAt))

        // 2. Project board task submissions
        const projSubmissions = await db.select({
            id: projectSubmissions.id,
            code: sql<string>`CONCAT(
                COALESCE(CONCAT('// 🔗 GitHub / Pull Request: ', ${projectSubmissions.githubUrl}, '\n\n'), ''),
                COALESCE(CONCAT('// 📝 Коментар студента:\n// ', ${projectSubmissions.notes}, '\n\n'), ''),
                COALESCE(${projectSubmissions.code}, '// Код не прикріплено (перевірте посилання на GitHub)')
            )`,
            status: projectSubmissions.status,
            mentorFeedback: projectSubmissions.mentorFeedback,
            createdAt: projectSubmissions.createdAt,
            userName: users.name,
            userEmail: users.email,
            taskTitle: sql<string>`CONCAT('🏢 [', COALESCE(${projectBoards.title}, 'Проєкт'), '] ', ${projectTasks.title})`,
            taskId: projectTasks.id,
            isProject: sql<boolean>`true`
        })
        .from(projectSubmissions)
        .innerJoin(users, eq(projectSubmissions.userId, users.id))
        .innerJoin(projectTasks, eq(projectSubmissions.taskId, projectTasks.id))
        .leftJoin(projectBoards, eq(projectSubmissions.boardId, projectBoards.id))
        .orderBy(desc(projectSubmissions.createdAt))

        // Combine and sort by createdAt descending
        const combined = [...regularSubmissions, ...projSubmissions].sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime()
            const timeB = new Date(b.createdAt || 0).getTime()
            return timeB - timeA
        })

        return NextResponse.json(combined)
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
        const { submissionId, feedback, status, isProject } = await req.json()

        if (!submissionId || !feedback) {
            return NextResponse.json({ error: "Missing submissionId or feedback" }, { status: 400 })
        }

        const finalStatus = status || "reviewed"

        if (isProject) {
            // Update project submission
            await db.update(projectSubmissions)
                .set({
                    mentorFeedback: feedback,
                    status: finalStatus,
                    reviewedAt: new Date()
                })
                .where(eq(projectSubmissions.id, submissionId))

            // Fetch details for notification
            const projWithUser = await db.select({
                userEmail: users.email,
                userName: users.firstName,
                backupName: users.name,
                taskTitle: projectTasks.title,
                telegramChatId: users.telegramChatId,
            })
            .from(projectSubmissions)
            .innerJoin(users, eq(projectSubmissions.userId, users.id))
            .innerJoin(projectTasks, eq(projectSubmissions.taskId, projectTasks.id))
            .where(eq(projectSubmissions.id, submissionId))
            .then(res => res[0])

            if (projWithUser) {
                const name = projWithUser.userName || projWithUser.backupName || "Студент"
                // Send Telegram Notification
                if (projWithUser.telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
                    const isPassed = finalStatus === "reviewed"
                    const emoji = isPassed ? "✅" : "⚠️"
                    const statusText = isPassed ? "Зараховано ментором" : "Потребує доопрацювання"
                    
                    const tgMessage = `Привіт, ${name}! 👋\n\n` +
                        `Ваше рішення по проєкту *"${projWithUser.taskTitle}"* перевірено ментором.\n\n` +
                        `Статус: ${emoji} *${statusText}*\n\n` +
                        `📝 Відгук ментора:\n_${feedback}_\n\n` +
                        `[Переглянути в кабінеті](https://itplatform-three.vercel.app/cabinet?tab=submissions)`

                    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: projWithUser.telegramChatId,
                            text: tgMessage,
                            parse_mode: "Markdown"
                        })
                    }).catch(e => console.error("Failed to send telegram feedback:", e))
                }
            }

            return NextResponse.json({ success: true })
        }

        // Regular task submission update
        await db.update(taskSubmissions)
            .set({ 
                mentorFeedback: feedback, 
                status: finalStatus,
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
            const name = submissionWithUser.userName || submissionWithUser.backupName || "Студент"
            
            // Send Email
            if (submissionWithUser.userEmail) {
                const { sendMentorFeedbackEmail } = await import("@/lib/email")
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
