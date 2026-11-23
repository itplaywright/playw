import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, projectSubmissions, projectTasks, projectBoards, tasks, interviewSessions } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc, sql, or, and } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Course task submissions
        const courseSubmissions = await db.select({
            id: taskSubmissions.id as any,
            taskId: taskSubmissions.taskId as any,
            taskTitle: tasks.title,
            code: taskSubmissions.code,
            mentorFeedback: taskSubmissions.mentorFeedback,
            status: taskSubmissions.status,
            createdAt: taskSubmissions.createdAt,
            reviewedAt: taskSubmissions.reviewedAt,
            isProject: sql<boolean>`false`
        })
        .from(taskSubmissions)
        .innerJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
        .where(eq(taskSubmissions.userId, session.user.id))
        .orderBy(desc(taskSubmissions.createdAt))

        // 2. Project submissions
        const projSubmissions = await db.select({
            id: projectSubmissions.id as any,
            taskId: projectSubmissions.taskId as any,
            taskTitle: sql<string>`CONCAT('🏢 [', COALESCE(${projectBoards.title}, 'Проєкт'), '] ', ${projectTasks.title})`,
            code: sql<string>`CONCAT(
                COALESCE(CONCAT('// 🔗 GitHub / Pull Request: ', ${projectSubmissions.githubUrl}, '\n\n'), ''),
                COALESCE(CONCAT('// 📝 Нотатки:\n// ', ${projectSubmissions.notes}, '\n\n'), ''),
                COALESCE(${projectSubmissions.code}, '// Рішення через посилання на GitHub')
            )`,
            mentorFeedback: projectSubmissions.mentorFeedback,
            status: projectSubmissions.status,
            createdAt: projectSubmissions.createdAt,
            reviewedAt: projectSubmissions.reviewedAt,
            isProject: sql<boolean>`true`
        })
        .from(projectSubmissions)
        .innerJoin(projectTasks, eq(projectSubmissions.taskId, projectTasks.id))
        .leftJoin(projectBoards, eq(projectSubmissions.boardId, projectBoards.id))
        .where(eq(projectSubmissions.userId, session.user.id))
        .orderBy(desc(projectSubmissions.createdAt))

        // 3. Interview & Live Coding submissions sent to mentor
        const interviewRecords = await db.select({
            id: interviewSessions.id,
            roleLevel: interviewSessions.roleLevel,
            totalScore: interviewSessions.totalScore,
            status: interviewSessions.status,
            feedback: interviewSessions.feedback,
            createdAt: interviewSessions.createdAt,
            updatedAt: interviewSessions.updatedAt,
        })
        .from(interviewSessions)
        .where(
            and(
                eq(interviewSessions.userId, session.user.id),
                or(
                    eq(interviewSessions.status, "pending_review"),
                    eq(interviewSessions.status, "reviewed"),
                    eq(interviewSessions.status, "rejected")
                )
            )
        )
        .orderBy(desc(interviewSessions.createdAt))

        const interviewSubmissions = interviewRecords.map(rec => {
            const fb = (rec.feedback || {}) as any
            const isCoding = fb.type === "coding_challenge"

            let formattedCode = ""
            let taskTitle = ""

            if (isCoding) {
                taskTitle = `💻 [Лайв-кодинг] ${fb.challengeTitle || rec.roleLevel.toUpperCase()}`
                formattedCode = `// 🎯 Завдання: ${fb.challengeTitle || 'Playwright Challenge'}\n` +
                    `// 📊 Попередня оцінка Lead QA: ${rec.totalScore}/100\n` +
                    (fb.candidateNotes ? `// 💬 Ваш коментар ментору: ${fb.candidateNotes}\n\n` : `\n`) +
                    `${fb.code || '// Код'}`
            } else {
                taskTitle = `🎙️ [Співбесіда] ${rec.roleLevel.toUpperCase()} QA Automation`
                const strengthsList = Array.isArray(fb.strengths) && fb.strengths.length > 0
                    ? fb.strengths.map((s: string) => `// • ${s}`).join('\n')
                    : '// • Базові принципи'

                formattedCode = `// 🎙️ Результат технічної співбесіди (${rec.roleLevel.toUpperCase()})\n` +
                    `// 📊 Загальний бал: ${rec.totalScore}/100\n` +
                    `// 🏆 Рівень готовності: ${fb.readinessLevel || 'Оцінено'}\n` +
                    (fb.candidateNotes ? `// 💬 Ваш коментар ментору: ${fb.candidateNotes}\n\n` : `\n`) +
                    `// 🌟 Сильні сторони:\n${strengthsList}\n\n` +
                    `// 📝 Підсумок:\n// ${fb.summaryUk || fb.summaryEn || 'Співбесіду завершено'}`
            }

            const currentStatus = (fb.mentorStatus as any) || (rec.status === "reviewed" ? "reviewed" : rec.status === "rejected" ? "rejected" : "pending")

            return {
                id: rec.id as any,
                taskId: rec.id as any,
                taskTitle,
                code: formattedCode,
                mentorFeedback: fb.mentorFeedback || null,
                status: currentStatus as "pending" | "reviewed" | "rejected",
                createdAt: rec.createdAt,
                reviewedAt: fb.reviewedAt ? new Date(fb.reviewedAt) : null,
                isProject: false
            }
        })

        const combined = [...courseSubmissions, ...projSubmissions, ...interviewSubmissions].sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime()
            const timeB = new Date(b.createdAt || 0).getTime()
            return timeB - timeA
        })

        return NextResponse.json(combined)
    } catch (error) {
        console.error("Fetch user submissions error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
