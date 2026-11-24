"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useLocale } from "next-intl"

const translations = {
    ru: {
        title: "Новый пароль",
        subtitle: "Придумайте надежный пароль для вашего аккаунта",
        newPassword: "Новый пароль",
        confirmPassword: "Подтвердите пароль",
        submit: "Сохранить новый пароль",
        successTitle: "Пароль успешно изменен!",
        successDesc: "Теперь вы можете войти в систему, используя ваш новый пароль.",
        goToLogin: "Войти в аккаунт",
        passwordsMismatch: "Пароли не совпадают",
        passwordMinLength: "Пароль должен содержать минимум 6 символов",
        missingParams: "Отсутствует токен или email для сброса пароля. Запросите новую ссылку.",
        requestNewLink: "Запросить новую ссылку",
    },
    uk: {
        title: "Новий пароль",
        subtitle: "Встановіть надійний пароль для вашого акаунту",
        newPassword: "Новий пароль",
        confirmPassword: "Підтвердіть пароль",
        submit: "Зберегти новий пароль",
        successTitle: "Пароль успішно змінено!",
        successDesc: "Тепер ви можете увійти до системи, використовуючи свій новий пароль.",
        goToLogin: "Увійти до акаунту",
        passwordsMismatch: "Паролі не співпадають",
        passwordMinLength: "Пароль має містити мінімум 6 символів",
        missingParams: "Відсутній токен або email для відновлення. Запишіть нове посилання.",
        requestNewLink: "Запросити нове посилання",
    },
    en: {
        title: "Reset Password",
        subtitle: "Create a secure new password for your account",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        submit: "Save New Password",
        successTitle: "Password reset successful!",
        successDesc: "You can now log in using your new credentials.",
        goToLogin: "Go to Login",
        passwordsMismatch: "Passwords do not match",
        passwordMinLength: "Password must be at least 6 characters long",
        missingParams: "Missing reset token or email. Please request a new link.",
        requestNewLink: "Request new reset link",
    }
}

function ResetPasswordForm() {
    const locale = useLocale() as "ru" | "uk" | "en"
    const t = translations[locale] || translations.uk

    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""
    const email = searchParams.get("email") || ""

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    if (!token || !email) {
        return (
            <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Помилка посилання</h2>
                <p className="text-sm text-muted-foreground">{t.missingParams}</p>
                <div className="pt-2">
                    <Link
                        href="/forgot-password"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-all"
                    >
                        {t.requestNewLink}
                    </Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword.length < 6) {
            setError(t.passwordMinLength)
            return
        }

        if (newPassword !== confirmPassword) {
            setError(t.passwordsMismatch)
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Не вдалося скинути пароль")
            }

            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || "Сталася помилка при збереженні пароля")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t.successTitle}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.successDesc}</p>
                <div className="pt-4">
                    <Link
                        href="/login"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
                    >
                        {t.goToLogin}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    для <span className="font-semibold text-foreground">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="newPassword">
                        {t.newPassword}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full h-12 bg-muted/30 border border-border rounded-xl pl-12 pr-12 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:bg-white/5"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="confirmPassword">
                        {t.confirmPassword}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full h-12 bg-muted/30 border border-border rounded-xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:bg-white/5"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 text-sm mt-2"
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
    )
}

export default function ResetPasswordPage() {
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
                    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    )
}
