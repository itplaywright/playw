"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react"
import { useLocale } from "next-intl"

const translations = {
    ru: {
        title: "Восстановление пароля",
        subtitle: "Введите ваш email, и мы отправим ссылку для сброса пароля",
        email: "Email",
        submit: "Отправить ссылку",
        backToLogin: "Вернуться ко входу",
        successTitle: "Проверьте почту!",
        successDesc: "Мы отправили инструкции по восстановлению пароля на",
        spamNotice: "Если письмо не пришло в течение нескольких минут, проверьте папку «Спам».",
        sendAgain: "Отправить повторно",
        devNotice: "Тестовая ссылка для восстановления (SMTP не настроен):",
        openResetPage: "Перейти к сбросу пароля →"
    },
    uk: {
        title: "Відновлення пароля",
        subtitle: "Введіть свій email, і ми надішлемо посилання для відновлення",
        email: "Email",
        submit: "Надіслати посилання",
        backToLogin: "Повернутися до входу",
        successTitle: "Перевірте пошту!",
        successDesc: "Ми надіслали інструкції для відновлення пароля на",
        spamNotice: "Якщо лист не надійшов протягом кількох хвилин, перевірте папку «Спам».",
        sendAgain: "Надіслати повторно",
        devNotice: "Тестове посилання для скидання (SMTP не налаштовано):",
        openResetPage: "Перейти до зміни пароля →"
    },
    en: {
        title: "Forgot Password",
        subtitle: "Enter your email address and we'll send you a password reset link",
        email: "Email",
        submit: "Send Reset Link",
        backToLogin: "Back to Login",
        successTitle: "Check your email!",
        successDesc: "We've sent password reset instructions to",
        spamNotice: "If you don't receive an email within a few minutes, please check your spam folder.",
        sendAgain: "Resend email",
        devNotice: "Test reset link (SMTP not configured):",
        openResetPage: "Proceed to reset password →"
    }
}

export default function ForgotPasswordPage() {
    const locale = useLocale() as "ru" | "uk" | "en"
    const t = translations[locale] || translations.uk

    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [devResetLink, setDevResetLink] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, locale })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Не вдалося надіслати запит")
            }

            setIsSubmitted(true)
            if (data.devResetLink) {
                setDevResetLink(data.devResetLink)
            }
        } catch (err: any) {
            setError(err.message || "Сталася помилка. Спробуйте пізніше.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden px-4">
            <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px] dark:bg-blue-600/10" />
            <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px] dark:bg-purple-600/10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass border border-border rounded-3xl p-8 shadow-2xl overflow-hidden relative dark:glass-dark">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

                    {!isSubmitted ? (
                        <>
                            <div className="mb-8 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t.title}</h1>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t.subtitle}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="email">
                                        {t.email}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full h-12 bg-muted/30 border border-border rounded-xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 text-sm"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t.submit}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-2 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">{t.successTitle}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t.successDesc} <span className="font-bold text-foreground">{email}</span>.
                            </p>
                            <p className="text-xs text-muted-foreground/80 bg-secondary/50 p-3 rounded-xl border border-border">
                                {t.spamNotice}
                            </p>

                            {devResetLink && (
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left text-xs space-y-2">
                                    <p className="font-bold text-blue-400">{t.devNotice}</p>
                                    <a
                                        href={devResetLink}
                                        className="text-blue-500 hover:underline font-mono break-all block"
                                    >
                                        {t.openResetPage}
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={() => { setIsSubmitted(false); setDevResetLink(null); }}
                                className="text-xs text-blue-500 hover:underline font-semibold block mx-auto pt-2"
                            >
                                {t.sendAgain}
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <Link
                            href="/login"
                            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t.backToLogin}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
