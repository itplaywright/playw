import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectSubmissions, projectTasks, projectBoards, users } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, and, desc } from "drizzle-orm"
import { getUserPermissions } from "@/lib/permissions"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const boardId = searchParams.get("boardId")

    try {
        const conditions = [eq(projectSubmissions.userId, session.user.id)]
        if (boardId) {
            conditions.push(eq(projectSubmissions.boardId, parseInt(boardId)))
        }

        const list = await db.select({
            id: projectSubmissions.id,
            boardId: projectSubmissions.boardId,
            taskId: projectSubmissions.taskId,
            githubUrl: projectSubmissions.githubUrl,
            code: projectSubmissions.code,
            notes: projectSubmissions.notes,
            mentorFeedback: projectSubmissions.mentorFeedback,
            status: projectSubmissions.status,
            createdAt: projectSubmissions.createdAt,
            reviewedAt: projectSubmissions.reviewedAt,
        })
            .from(projectSubmissions)
            .where(and(...conditions))
            .orderBy(desc(projectSubmissions.createdAt))

        return NextResponse.json(list)
    } catch (err: any) {
        console.error("Failed to fetch project submissions:", err)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.user.id, (session.user as any).role)
    if (!permissions.hasPracticeAccess) {
        return NextResponse.json({
            error: "Практичні проєкти доступні у тарифах Base, PRO та VIP. Оновіть ваш тариф для здачі робіт.",
            upgradeRequired: true
        }, { status: 403 })
    }

    try {
        const { boardId, taskId, githubUrl, code, notes } = await req.json()

        if (!boardId || !taskId) {
            return NextResponse.json({ error: "Missing boardId or taskId" }, { status: 400 })
        }

        if (!githubUrl?.trim() && !code?.trim()) {
            return NextResponse.json({ error: "Будь ласка, вкажіть GitHub URL або додайте код рішення" }, { status: 400 })
        }

        // Fetch task and board info
        const task = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId)
        })
        const board = await db.query.projectBoards.findFirst({
            where: eq(projectBoards.id, boardId)
        })

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        // Insert submission
        const [result] = await db.insert(projectSubmissions).values({
            userId: session.user.id,
            boardId,
            taskId,
            githubUrl: githubUrl?.trim() || null,
            code: code?.trim() || null,
            notes: notes?.trim() || null,
            status: "pending",
        })

        // Notify Mentor via Telegram if configured
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

        if (botToken && chatId) {
            const studentName = session.user.name || session.user.email || "Студент"
            const message = `🚀 *Нове рішення по проєкту на перевірку!*\n\n` +
                `👤 *Студент:* ${studentName}\n` +
                `🏢 *Проєкт:* ${board?.title || 'Проєкт'}\n` +
                `📋 *Завдання:* ${task.title}\n` +
                (githubUrl ? `🔗 *GitHub / PR:* ${githubUrl}\n` : '') +
                `👉 [Відкрити адмінку](https://itplatform-three.vercel.app/admin/submissions)`

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

        return NextResponse.json({ success: true, submissionId: result.insertId })
    } catch (err: any) {
        console.error("Failed to submit project task:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
