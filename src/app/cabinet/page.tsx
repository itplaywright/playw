"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    LayoutDashboard, MessageCircle, BarChart2, CheckCircle2,
    Clock, Target, Zap, TrendingUp, ChevronRight, ArrowRight, User, BookOpen
} from "lucide-react"
import Link from "next/link"

type Section = "overview" | "questions" | "progress"

interface Stats {
    totalTasks: number
    completedTasks: number
    totalAttempts: number
    successRate: number
    pendingQuestions: number
    trackProgress: { id: number; title: string; order: number; total: number; done: number }[]
}

export default function UserCabinetPage() {
    const [section, setSection] = useState<Section>("overview")
    const [questions, setQuestions] = useState<any[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchQuestions(), fetchStats()]).finally(() => setIsLoading(false))
    }, [])

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions")
            const data = await res.json()
            setQuestions(Array.isArray(data) ? data : [])
            if (Array.isArray(data) && data.some((q: any) => q.status === 'answered' && !q.isReadByUser)) {
                await fetch("/api/questions/mark-read", { method: "POST" })
            }
        } catch {
            toast.error("Не вдалося завантажити питання")
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/user/stats")
            const data = await res.json()
            if (!data.error) setStats(data)
        } catch {
            // Stats are optional — don't block the UI
        }
    }

    const navItems: { id: Section; label: string; icon: any }[] = [
        { id: "overview", label: "Огляд", icon: LayoutDashboard },
        { id: "progress", label: "Прогрес", icon: BarChart2 },
        { id: "questions", label: "Мої питання", icon: MessageCircle },
    ]

    const answeredCount = questions.filter(q => q.status === "answered").length
    const pendingCount = questions.filter(q => q.status === "pending").length

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-[#0f172a] flex flex-col">
                {/* Logo/User area */}
                <div className="px-6 py-8 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Мій кабінет</p>
                            <p className="text-slate-400 text-xs">IT Playwright Platform</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setSection(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${section === id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {id === "questions" && pendingCount > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom link */}
                <div className="px-3 pb-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                    >
                        <BookOpen className="w-4 h-4" />
                        До навчання
                        <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium text-sm">Завантаження даних...</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-5xl mx-auto">
                        {/* OVERVIEW */}
                        {section === "overview" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Огляд</h1>
                                    <p className="text-slate-500 mt-1 text-sm">Ваш поточний статус навчання на платформі.</p>
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <StatCard
                                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                        bg="bg-emerald-50"
                                        label="Виконано завдань"
                                        value={stats ? `${stats.completedTasks} / ${stats.totalTasks}` : "—"}
                                        sub={stats ? `${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}% від курсу` : ""}
                                    />
                                    <StatCard
                                        icon={<Target className="w-5 h-5 text-blue-600" />}
                                        bg="bg-blue-50"
                                        label="Успішність"
                                        value={stats ? `${stats.successRate}%` : "—"}
                                        sub={stats ? `з ${stats.totalAttempts} спроб` : ""}
                                    />
                                    <StatCard
                                        icon={<Zap className="w-5 h-5 text-violet-600" />}
                                        bg="bg-violet-50"
                                        label="Всього спроб"
                                        value={stats ? String(stats.totalAttempts) : "—"}
                                        sub="симуляцій та тестів"
                                    />
                                    <StatCard
                                        icon={<MessageCircle className="w-5 h-5 text-amber-600" />}
                                        bg="bg-amber-50"
                                        label="Питань ментору"
                                        value={String(questions.length)}
                                        sub={`${answeredCount} отримали відповідь`}
                                    />
                                </div>

                                {/* Course progress bar */}
                                {stats && stats.trackProgress.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
                                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                            Загальний прогрес курсу
                                        </h2>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-slate-500 text-xs">Курс пройдено</span>
                                            <span className="font-bold text-sm text-slate-800">
                                                {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/dashboard" className="group flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm">Продовжити навчання</p>
                                            <p className="text-slate-500 text-xs">Перейти до завдань</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </Link>
                                    <button
                                        onClick={() => setSection("questions")}
                                        className="group flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
                                    >
                                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-slate-900 text-sm">Мої питання</p>
                                            <p className="text-slate-500 text-xs">{pendingCount > 0 ? `${pendingCount} очікують відповіді` : "Всі питання опрацьовані"}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PROGRESS */}
                        {section === "progress" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Прогрес по рівнях</h1>
                                    <p className="text-slate-500 mt-1 text-sm">Деталізований статус виконання завдань по кожному треку.</p>
                                </div>

                                {stats?.trackProgress && stats.trackProgress.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.trackProgress.map((track) => {
                                            const pct = track.total > 0 ? Math.round((track.done / track.total) * 100) : 0
                                            const isDone = pct === 100
                                            return (
                                                <div key={track.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isDone ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                                                                {track.order}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm leading-tight">{track.title}</p>
                                                                <p className="text-slate-400 text-xs mt-0.5">{track.done} з {track.total} завдань</p>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDone ? "bg-emerald-100 text-emerald-700" : pct > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                                                            {isDone ? "Завершено" : pct > 0 ? "В процесі" : "Не розпочато"}
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className={`h-2.5 rounded-full transition-all duration-700 ${isDone ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-blue-400 to-blue-600"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <span className="text-xs font-bold text-slate-400">{pct}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<BarChart2 className="w-8 h-8 text-slate-300" />}
                                        title="Даних ще немає"
                                        text="Почніть виконувати завдання — ваш прогрес з'явиться тут."
                                        href="/dashboard"
                                        cta="До завдань"
                                    />
                                )}
                            </div>
                        )}

                        {/* QUESTIONS */}
                        {section === "questions" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Мої питання</h1>
                                    <p className="text-slate-500 mt-1 text-sm">Питання ментору та їх відповіді.</p>
                                </div>

                                {questions.length === 0 ? (
                                    <EmptyState
                                        icon={<MessageCircle className="w-8 h-8 text-slate-300" />}
                                        title="Ви ще не ставили питань"
                                        text="Якщо у вас виникнуть труднощі під час виконання завдань, запитайте ментора."
                                        href="/dashboard"
                                        cta="До завдань"
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {questions.map((q) => (
                                            <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(q.createdAt).toLocaleDateString("uk-UA")} о {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${q.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                            {q.status === "pending" ? "Очікує" : "Відповідь отримано"}
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-900 font-semibold text-sm leading-relaxed mb-4">
                                                        "{q.content}"
                                                    </p>

                                                    {q.status === "answered" ? (
                                                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Відповідь ментора</p>
                                                                    <p className="text-slate-700 text-sm italic leading-relaxed">{q.answer}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                                            <p className="text-xs text-slate-400 font-medium">Ментор скоро відповість...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

function StatCard({ icon, bg, label, value, sub }: {
    icon: React.ReactNode
    bg: string
    label: string
    value: string
    sub: string
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-slate-800 font-semibold text-xs">{label}</p>
            {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
        </div>
    )
}

function EmptyState({ icon, title, text, href, cta }: {
    icon: React.ReactNode
    title: string
    text: string
    href: string
    cta: string
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">{text}</p>
            <Link
                href={href}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
                {cta} <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    )
}
