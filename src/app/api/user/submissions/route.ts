import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, projectSubmissions, projectTasks, projectBoards, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, desc, sql } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Course task submissions
        const courseSubmissions = await db.select({
            id: taskSubmissions.id,
            taskId: taskSubmissions.taskId,
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
            id: projectSubmissions.id,
            taskId: projectSubmissions.taskId,
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

        const combined = [...courseSubmissions, ...projSubmissions].sort((a, b) => {
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
