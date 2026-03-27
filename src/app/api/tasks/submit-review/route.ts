import { auth } from "@/lib/auth"
import { db } from "@/db"
import { taskSubmissions, tasks } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { code, taskId } = await req.json()

        if (!code || !taskId) {
            return NextResponse.json({ error: "Missing code or taskId" }, { status: 400 })
        }

        // Check if task exists
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId)
        })

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        // Create submission
        const [newSubmission] = await db.insert(taskSubmissions).values({
            userId: session.user.id,
            taskId: taskId,
            code: code,
            status: "pending",
        }).$returningId()

        // Optional: Notify mentor via Telegram if configured
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

        if (botToken && chatId) {
            const message = `🚀 *Нове рішення на перевірку!*\n\n` +
                `👤 Студент: ${session.user.name || session.user.email}\n` +
                `📚 Завдання: ${task.title}\n` +
                `🔗 [Відкрити адмінку](https://itplatform-three.vercel.app/admin/submissions)`

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

        return NextResponse.json({ success: true, submissionId: newSubmission.id })
    } catch (error) {
        console.error("Submission error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
