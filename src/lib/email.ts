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
