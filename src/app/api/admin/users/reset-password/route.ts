import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { userId, newPassword, sendResetEmail, locale = "uk" } = body

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        })

        if (!targetUser) {
            return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 })
        }

        // 1. Direct password change by admin
        if (newPassword) {
            if (typeof newPassword !== "string" || newPassword.length < 6) {
                return NextResponse.json({ error: "Пароль має містити мінімум 6 символів" }, { status: 400 })
            }

            const passwordHash = await bcrypt.hash(newPassword, 10)
            await db.update(users)
                .set({ passwordHash })
                .where(eq(users.id, userId))

            return NextResponse.json({
                success: true,
                message: `Пароль для ${targetUser.email} успішно змінено!`
            })
        }

        // 2. Send reset password link to user's email
        if (sendResetEmail && targetUser.email) {
            const token = crypto.randomBytes(32).toString("hex")
            const expires = new Date(Date.now() + 60 * 60 * 1000)

            await db.delete(verificationTokens).where(eq(verificationTokens.identifier, targetUser.email))
            await db.insert(verificationTokens).values({
                identifier: targetUser.email,
                token,
                expires,
            })

            const host = req.headers.get("host") || "itplatform-three.vercel.app"
            const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
            const resetLink = `${baseUrl}/${locale}/reset-password?token=${token}&email=${encodeURIComponent(targetUser.email)}`

            const emailSent = await sendPasswordResetEmail({
                toEmail: targetUser.email,
                userName: targetUser.firstName || targetUser.name || targetUser.email.split("@")[0],
                resetLink,
            })

            return NextResponse.json({
                success: true,
                emailSent,
                resetLink,
                message: `Посилання для скидання пароля надіслано на ${targetUser.email}`
            })
        }

        return NextResponse.json({ error: "Вкажіть newPassword або sendResetEmail" }, { status: 400 })
    } catch (error: any) {
        console.error("Admin reset password error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
