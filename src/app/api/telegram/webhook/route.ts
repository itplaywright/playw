import { db } from "@/db"
import { users } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    try {
        const payload = await req.json()
        
        // Telegram typically sends updates in the "message" object
        if (payload.message && payload.message.text && payload.message.chat?.id) {
            const text: string = payload.message.text
            const chatId: string = payload.message.chat.id.toString()
            
            // Expected format: "/start userId"
            if (text.startsWith("/start ")) {
                const userId = text.split(" ")[1]
                
                if (userId) {
                    // Update user's telegramChatId
                    await db.update(users)
                        .set({ telegramChatId: chatId })
                        .where(eq(users.id, userId))
                    
                    // Send confirmation message back to the user
                    const botToken = process.env.TELEGRAM_BOT_TOKEN
                    if (botToken) {
                        try {
                            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: "✅ Ваш акаунт успішно прив'язано! Тепер ви будете отримувати тут сповіщення від ментора."
                                })
                            })
                        } catch (e) {
                            console.error("Failed to send welcome msg via Telegram:", e)
                        }
                    }
                }
            }
        }
        
        // Always return 200 OK to Telegram so it doesn't retry
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("Telegram webhook error:", error)
        return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
    }
}
