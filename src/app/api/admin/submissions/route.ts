import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, projectSubmissions, projectTasks, projectBoards, users, tasks, interviewSessions } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc, sql, or } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Regular course task submissions
        const regularSubmissions = await db.select({
            id: taskSubmissions.id as any,
            code: taskSubmissions.code,
            status: taskSubmissions.status,
            mentorFeedback: taskSubmissions.mentorFeedback,
            createdAt: taskSubmissions.createdAt,
            userName: users.name,
            userEmail: users.email,
            taskTitle: tasks.title,
            taskId: tasks.id as any,
            isProject: sql<boolean>`false`,
            isInterview: sql<boolean>`false`
        })
        .from(taskSubmissions)
        .innerJoin(users, eq(taskSubmissions.userId, users.id))
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .orderBy(desc(taskSubmissions.createdAt))

        // 2. Project board task submissions
        const projSubmissions = await db.select({
            id: projectSubmissions.id as any,
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
            taskId: projectTasks.id as any,
            isProject: sql<boolean>`true`,
            isInterview: sql<boolean>`false`
        })
        .from(projectSubmissions)
        .innerJoin(users, eq(projectSubmissions.userId, users.id))
        .innerJoin(projectTasks, eq(projectSubmissions.taskId, projectTasks.id))
        .leftJoin(projectBoards, eq(projectSubmissions.boardId, projectBoards.id))
        .orderBy(desc(projectSubmissions.createdAt))

        // 3. Interview & Live Coding submissions
        const interviewRecords = await db.select({
            id: interviewSessions.id,
            roleLevel: interviewSessions.roleLevel,
            totalScore: interviewSessions.totalScore,
            status: interviewSessions.status,
            feedback: interviewSessions.feedback,
            createdAt: interviewSessions.createdAt,
            userName: users.name,
            userEmail: users.email,
        })
        .from(interviewSessions)
        .innerJoin(users, eq(interviewSessions.userId, users.id))
        .where(or(
            eq(interviewSessions.status, "pending_review"),
            eq(interviewSessions.status, "reviewed"),
            eq(interviewSessions.status, "rejected")
        ))
        .orderBy(desc(interviewSessions.createdAt))

        const interviewSubmissions = interviewRecords.map(rec => {
            const fb = (rec.feedback || {}) as any
            const isCoding = fb.type === "coding_challenge"

            let formattedCode = ""
            let taskTitle = ""

            if (isCoding) {
                taskTitle = `💻 [Лайв-кодинг] ${fb.challengeTitle || rec.roleLevel.toUpperCase()}`
                formattedCode = `// 🎯 Завдання: ${fb.challengeTitle || 'Playwright Coding Challenge'}\n` +
                    `// 📊 Попередня оцінка Lead QA: ${rec.totalScore}/100\n` +
                    (fb.candidateNotes ? `// 💬 Коментар студента: ${fb.candidateNotes}\n\n` : `\n`) +
                    `${fb.code || '// Код не прикріплено'}`
            } else {
                taskTitle = `🎙️ [Співбесіда] ${rec.roleLevel.toUpperCase()} QA Automation`
                const strengthsList = Array.isArray(fb.strengths) && fb.strengths.length > 0
                    ? fb.strengths.map((s: string) => `// • ${s}`).join('\n')
                    : '// • Базові принципи автоматизації'
                const improvementsList = Array.isArray(fb.improvements) && fb.improvements.length > 0
                    ? fb.improvements.map((i: string) => `// • ${i}`).join('\n')
                    : '// • Поглиблення практичних навичок'

                formattedCode = `// 🎙️ Результат технічної співбесіди (${rec.roleLevel.toUpperCase()})\n` +
                    `// 📊 Загальний бал: ${rec.totalScore}/100\n` +
                    `// 🏆 Рівень готовності: ${fb.readinessLevel || 'Оцінено'}\n` +
                    (fb.candidateNotes ? `// 💬 Коментар студента: ${fb.candidateNotes}\n\n` : `\n`) +
                    `// 🌟 Сильні сторони кандидата:\n${strengthsList}\n\n` +
                    `// ⚠️ Зони для практики:\n${improvementsList}\n\n` +
                    `// 📝 Підсумок:\n// ${fb.summaryUk || fb.summaryEn || 'Співбесіду завершено'}`
            }

            const currentStatus = (fb.mentorStatus as any) || (rec.status === "reviewed" ? "reviewed" : rec.status === "rejected" ? "rejected" : "pending")

            return {
                id: rec.id as any,
                code: formattedCode,
                status: currentStatus as "pending" | "reviewed" | "rejected",
                mentorFeedback: fb.mentorFeedback || null,
                createdAt: rec.createdAt,
                userName: rec.userName,
                userEmail: rec.userEmail,
                taskTitle,
                taskId: rec.id as any,
                isProject: false,
                isInterview: true
            }
        })

        // Combine all 3 sources and sort by createdAt descending
        const combined = [...regularSubmissions, ...projSubmissions, ...interviewSubmissions].sort((a, b) => {
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
        const { submissionId, feedback, status, isProject, isInterview } = await req.json()

        if (!submissionId || !feedback) {
            return NextResponse.json({ error: "Missing submissionId or feedback" }, { status: 400 })
        }

        const finalStatus = status || "reviewed"

        // Handle Interview / Live Coding Submissions
        if (isInterview) {
            await db.update(interviewSessions)
                .set({
                    status: finalStatus,
                    feedback: sql`JSON_SET(
                        COALESCE(${interviewSessions.feedback}, '{}'),
                        '$.mentorFeedback', ${feedback},
                        '$.mentorStatus', ${finalStatus},
                        '$.reviewedAt', ${new Date().toISOString()}
                    )`
                })
                .where(eq(interviewSessions.id, String(submissionId)))

            // Fetch user info for Telegram Notification
            const sessionWithUser = await db.select({
                userEmail: users.email,
                userName: users.firstName,
                backupName: users.name,
                telegramChatId: users.telegramChatId,
                roleLevel: interviewSessions.roleLevel,
            })
            .from(interviewSessions)
            .innerJoin(users, eq(interviewSessions.userId, users.id))
            .where(eq(interviewSessions.id, String(submissionId)))
            .then(res => res[0])

            if (sessionWithUser?.telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
                const name = sessionWithUser.userName || sessionWithUser.backupName || "Студент"
                const isPassed = finalStatus === "reviewed"
                const emoji = isPassed ? "✅" : "⚠️"
                const statusText = isPassed ? "Зараховано ментором" : "Потребує доопрацювання"

                const tgMessage = `Привіт, ${name}! 👋\n\n` +
                    `Вашу роботу зі співбесіди / лайв-кодингу перевірено ментором.\n\n` +
                    `Статус: ${emoji} *${statusText}*\n\n` +
                    `📝 Відгук ментора:\n_${feedback}_\n\n` +
                    `[Переглянути в кабінеті](https://itplatform-three.vercel.app/cabinet?tab=submissions)`

                fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: sessionWithUser.telegramChatId,
                        text: tgMessage,
                        parse_mode: "Markdown"
                    })
                }).catch(e => console.error("Failed to send telegram feedback:", e))
            }

            return NextResponse.json({ success: true })
        }

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

            // 1. Send Telegram Notification
            if (submissionWithUser.telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
                const isPassed = finalStatus === "reviewed"
                const emoji = isPassed ? "✅" : "⚠️"
                const statusText = isPassed ? "Зараховано ментором" : "Потребує доопрацювання"
                
                const tgMessage = `Привіт, ${name}! 👋\n\n` +
                    `Ваше домашнє завдання *"${submissionWithUser.taskTitle}"* перевірено ментором.\n\n` +
                    `Статус: ${emoji} *${statusText}*\n\n` +
                    `📝 Відгук ментора:\n_${feedback}_\n\n` +
                    `[Переглянути в кабінеті](https://itplatform-three.vercel.app/cabinet?tab=submissions)`

                fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: submissionWithUser.telegramChatId,
                        text: tgMessage,
                        parse_mode: "Markdown"
                    })
                }).catch(e => console.error("Failed to send telegram feedback:", e))
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update submission error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
