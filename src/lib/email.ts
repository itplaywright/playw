import nodemailer from "nodemailer"

// Create reusable transporter object using the default SMTP transport
// By default we use Gmail settings since it's the requested provider
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASSWORD, 
    },
})

interface SendFeedbackEmailProps {
    toEmail: string
    userName: string
    taskTitle: string
    feedback: string
    status: "passed" | "failed" | string
}

export async function sendMentorFeedbackEmail({ toEmail, userName, taskTitle, feedback, status }: SendFeedbackEmailProps) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn("Email wasn't sent because SMTP credentials are not configured in .env.local")
        return false
    }

    const isPassed = status === "reviewed"
    const statusText = isPassed ? "Успішно складено ✅" : "Потребує доопрацювання ⚠️"
    const statusColor = isPassed ? "#10b981" : "#f59e0b"

    // Construct the HTML content
    const htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
            <div style="background-color: #1e1b4b; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">IT Platform</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #0f172a; margin-top: 0;">Привіт, ${userName}! 👋</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    ${isPassed 
                        ? `Вітаємо! Ваше виконання завдання <strong>"${taskTitle}"</strong> було успішно схвалено ментором! 🎉`
                        : `Ваше виконання завдання <strong>"${taskTitle}"</strong> було перевірено ментором.`}
                </p>
                
                <div style="margin: 24px 0; padding: 16px; background-color: #f1f5f9; border-left: 4px solid ${statusColor}; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Статус: <span style="color: ${statusColor}">${statusText}</span></h3>
                    <p style="margin-bottom: 0; color: #334155; font-style: italic;">
                        "${feedback}"
                    </p>
                </div>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    Увійдіть на платформу, щоб подивитися деталі та продовжити навчання!
                </p>
                
                <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://it-platform.vercel.app"}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Перейти до платформи
                    </a>
                </div>
            </div>
            
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
                Це автоматичне повідомлення. Будь ласка, не відповідайте на нього.
            </p>
        </div>
    `

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"IT Platform Mentor" <noreply@itplatform.local>', // sender address
            to: toEmail, // list of receivers
            subject: `Перевірка завдання: ${taskTitle} ${isPassed ? '✅' : '⚠️'}`, // Subject line
            text: `Ваше завдання "${taskTitle}" перевірено. Статус: ${statusText}. Відгук ментора: ${feedback}`, // plain text body
            html: htmlContent, // html body
        })

        console.log("Message sent: %s", info.messageId)
        return true
    } catch (error) {
        console.error("Error sending email:", error)
        return false
    }
}

interface SendPasswordResetEmailProps {
    toEmail: string
    userName?: string
    resetLink: string
}

export async function sendPasswordResetEmail({ toEmail, userName, resetLink }: SendPasswordResetEmailProps) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn("Email wasn't sent because SMTP credentials are not configured in .env.local")
        console.log("Password reset link:", resetLink)
        return false
    }

    const name = userName || toEmail.split("@")[0]
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 24px; border-radius: 16px; color: #f8fafc;">
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #60a5fa; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.025em;">Playwright Platform</h1>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Відновлення доступу до акаунту</p>
            </div>
            
            <div style="background-color: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Привіт, ${name}! 👋</h2>
                <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                    Ми отримали запит на скидання пароля для вашого акаунту <strong>${toEmail}</strong>.
                </p>
                <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                    Щоб встановити новий пароль, натисніть на кнопку нижче. Посилання дійсне протягом <strong>1 години</strong>:
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
                        Встановити новий пароль
                    </a>
                </div>

                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
                    Якщо кнопка не працює, скопіюйте це посилання у браузер:<br />
                    <a href="${resetLink}" style="color: #60a5fa; word-break: break-all;">${resetLink}</a>
                </p>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 16px; margin-bottom: 0;">
                    Якщо ви не надсилали цей запит, просто проігноруйте цей лист. Ваш пароль залишиться незмінним.
                </p>
            </div>
            
            <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
                © ${new Date().getFullYear()} Playwright Platform. Усі права захищено.
            </p>
        </div>
    `

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Playwright Platform" <noreply@itplatform.local>',
            to: toEmail,
            subject: "Скидання пароля | Playwright Platform 🔐",
            text: `Привіт, ${name}!\n\nДля скидання пароля перейдіть за посиланням:\n${resetLink}\n\nПосилання дійсне 1 годину.\nЯкщо ви не надсилали цей запит, проігноруйте це повідомлення.`,
            html: htmlContent,
        })
        console.log("Password reset email sent: %s", info.messageId)
        return true
    } catch (error) {
        console.error("Error sending password reset email:", error)
        return false
    }
}
