import { NextResponse } from "next/server"
import { db } from "@/db"
import { users, verificationTokens } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, token, newPassword } = body

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "Всі поля є обов'язковими" }, { status: 400 })
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return NextResponse.json({ error: "Пароль має містити мінімум 6 символів" }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()

        // Verify token
        const record = await db.query.verificationTokens.findFirst({
            where: and(
                eq(verificationTokens.identifier, normalizedEmail),
                eq(verificationTokens.token, token.trim())
            ),
        })

        if (!record) {
            return NextResponse.json({ error: "Недійсне або вже використане посилання" }, { status: 400 })
        }

        if (new Date() > new Date(record.expires)) {
            // Delete expired token
            await db.delete(verificationTokens).where(
                and(
                    eq(verificationTokens.identifier, normalizedEmail),
                    eq(verificationTokens.token, token.trim())
                )
            )
            return NextResponse.json({ error: "Термін дії посилання вичерпано. Будь ласка, надішліть новий запит." }, { status: 400 })
        }

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        })

        if (!user) {
            return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 })
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10)

        // Update user's password
        await db.update(users)
            .set({ passwordHash })
            .where(eq(users.id, user.id))

        // Delete token so it cannot be reused
        await db.delete(verificationTokens).where(
            and(
                eq(verificationTokens.identifier, normalizedEmail),
                eq(verificationTokens.token, token.trim())
            )
        )

        return NextResponse.json({
            success: true,
            message: "Пароль успішно змінено! Тепер ви можете увійти до свого акаунту."
        })
    } catch (error: any) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
