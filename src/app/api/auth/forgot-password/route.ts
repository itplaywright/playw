import { NextResponse } from "next/server"
import { db } from "@/db"
import { users, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, locale = "uk" } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        })

        // Even if user does not exist, return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "Якщо цей email зареєстрований, ви отримаєте інструкції для відновлення пароля."
            })
        }

        // Generate secure 32-byte hex token
        const token = crypto.randomBytes(32).toString("hex")
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Clear existing tokens for this email
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalizedEmail))

        // Save new token
        await db.insert(verificationTokens).values({
            identifier: normalizedEmail,
            token,
            expires,
        })

        // Determine base URL
        const host = req.headers.get("host") || "itplatform-three.vercel.app"
        const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

        const resetLink = `${baseUrl}/${locale}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

        const emailSent = await sendPasswordResetEmail({
            toEmail: normalizedEmail,
            userName: user.firstName || user.name || normalizedEmail.split("@")[0],
            resetLink,
        })

        return NextResponse.json({
            success: true,
            emailSent,
            message: "Посилання для відновлення пароля надіслано на вашу електронну пошту.",
            // In case SMTP is not configured in local environment:
            ...((!process.env.SMTP_USER || process.env.NODE_ENV !== "production") ? { devResetLink: resetLink } : {})
        })
    } catch (error: any) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
