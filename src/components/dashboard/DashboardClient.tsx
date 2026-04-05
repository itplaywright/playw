"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    BookOpen, Code2, ArrowRight, CheckCircle2, Clock, ChevronRight,
    BarChart2, Terminal, Layers, Star, Lock, Bell, User, Settings, Search, LayoutGrid, Sparkles, Target as TargetIcon
} from "lucide-react"

import Sidebar from "@/components/layout/Sidebar"

interface Task {
    id: number
    title: string
    description: string
    type: "code" | "quiz"
    difficulty: string | null
    order: number | null
    isActive: boolean | null
    trackId: number | null
    options?: string[] | null
}

interface Track {
    id: number
    title: string
    description: string | null
    order: number | null
    isActive: boolean | null
}

interface Project {
    id: number
    title: string
    description: string | null
}

interface TaskStatus {
    label: "Виконано" | "В процесі" | "Не розпочато"
}

interface Props {
    tracks: Track[]
    tasks: Task[]
    statusMap: Record<number, TaskStatus["label"]>
    isAdmin: boolean
    userName?: string | null
    userImage?: string | null
    firstName?: string | null
    hasContacts?: boolean
    projects: Project[]
    role?: {
        id: number
        name: string
        maxTrackOrder: number | null
    } | null
}

const DIFFICULTY_LABELS: Record<string, string> = {
    easy: "Легко",
    medium: "Середньо",
    hard: "Складно",
}

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: "bg-emerald-500",
    medium: "bg-amber-500",
    hard: "bg-red-500",
}

const STATUS_STYLES: Record<string, string> = {
    "Виконано": "bg-emerald-100 text-emerald-700",
    "В процесі": "bg-blue-100 text-blue-700",
    "Не розпочато": "bg-slate-100 text-slate-500",
}

export default function DashboardClient({ tracks, tasks, statusMap, isAdmin, userName, userImage, firstName, hasContacts, projects, role }: Props) {
    const searchParams = useSearchParams()
    const urlTrackId = searchParams.get("trackId")
    const [selectedTrackId, setSelectedTrackId] = useState<number>(
        urlTrackId ? parseInt(urlTrackId) : (tracks[0]?.id ?? 0)
    )

    useEffect(() => {
        if (urlTrackId) {
            const id = parseInt(urlTrackId)
            if (!isNaN(id)) setSelectedTrackId(id)
        }
    }, [urlTrackId])

    const selectedTrack = tracks.find(t => t.id === selectedTrackId)
    const trackTasks = tasks.filter(t => t.trackId === selectedTrackId)


    // Per-track progress
    const getTrackProgress = (trackId: number) => {
        const tTasks = tasks.filter(t => t.trackId === trackId)
        const done = tTasks.filter(t => statusMap[t.id] === "Виконано").length
        return { done, total: tTasks.length }
    }

    const filteredTasks = trackTasks

    const isProTrack = (order: number | null) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 2
        return (order ?? 0) > maxOrder
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0
    
    const displayFirstName = firstName || (userName ? userName.split(' ')[0] : 'Студент')
    const initials = displayFirstName.substring(0, 2).toUpperCase()

    // Find next suggested task
    const findNextTask = () => {
        const unlockedTasks = tasks.filter(t => {
            const track = tracks.find(tr => tr.id === t.trackId)
            return track && (!isProTrack(track.order) || isAdmin)
        })

        unlockedTasks.sort((a, b) => {
            const trackA = tracks.find(tr => tr.id === a.trackId)
            const trackB = tracks.find(tr => tr.id === b.trackId)
            if (trackA && trackB && trackA.order !== trackB.order) {
                return (trackA.order ?? 0) - (trackB.order ?? 0)
            }
            return (a.order ?? 0) - (b.order ?? 0)
        })

        const inProgress = unlockedTasks.find(t => statusMap[t.id] === "В процесі")
        if (inProgress) return inProgress

        return unlockedTasks.find(t => statusMap[t.id] === "Не розпочато")
    }

    const nextTask = findNextTask()

    // Contact Modal Logic
    const [showContactModal, setShowContactModal] = useState(false)
    const [contactForm, setContactForm] = useState({ telegram: "", whatsapp: "" })
    const [isSavingContacts, setIsSavingContacts] = useState(false)

    useEffect(() => {
        if (hasContacts === false && !localStorage.getItem("contacts_prompted")) {
            // Slight delay so the user sees the dashboard first
            const timer = setTimeout(() => setShowContactModal(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [hasContacts])

    const handleSaveContacts = async () => {
        setIsSavingContacts(true)
        try {
            await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactForm),
            })
        } catch (e) {
            console.error(e)
        } finally {
            setIsSavingContacts(false)
            localStorage.setItem("contacts_prompted", "true")
            setShowContactModal(false)
        }
    }

    const handleSkipContacts = () => {
        localStorage.setItem("contacts_prompted", "true")
        setShowContactModal(false)
    }

    const [greetingInfo, setGreetingInfo] = useState({
        greeting: "Привіт",
        subtitleNext: "Раді бачити тебе знову. Твоя наступна ціль вже чекає.",
        subtitleDone: "Всі таски закриті. Відмінна робота!"
    })

    useEffect(() => {
        const h = new Date().getHours()
        let timeGreeting = "Привіт"
        if (h >= 5 && h < 12) timeGreeting = "Доброго ранку"
        else if (h >= 12 && h < 18) timeGreeting = "Доброго дня"
        else if (h >= 18 && h < 23) timeGreeting = "Доброго вечора"
        else timeGreeting = "Доброї ночі"

        const GREETINGS = [
            timeGreeting,
            "Вітаємо на борту",
            "Готовий кодити?",
            "Час для нових звершень",
            "Раді бачити в строю",
            "Ідеальний день для кодингу",
            "Твій код чекає",
            "Магія починається тут",
            "Ready, set, code",
            "Скучив за консоллю?",
            "Новий спринт, нові перемоги",
            "Вітаємо в матриці",
            "npm start",
            "git commit -m 'Here again'",
            "Час ламати й будувати",
            "Додай магії у код"
        ]
        
        const SUBTITLES_NEXT = [
            "Твоя наступна ціль вже чекає.",
            "Підготували для тебе свіженьке завдання.",
            "Продовжмо з того місця, де ти зупинився.",
            "Новий код сам себе не напише. До роботи!",
            "Налаштовуй середовище, попереду цікавий челендж.",
            "Відкриємо IDE та підкоримо цей таск?",
            "Не гаймо часу, наступне завдання вже у твоєму беклозі.",
            "Сила автоматизації чекає на тебе.",
            "Світ розробки став ще ближчим. Поїхали!",
            "Хтось сказав 'чистий код'? Твій наступний крок чекає.",
            "Bugfix чи нова фіча? Час дізнатися.",
            "Сервер працює, кава готова. Твоя черга.",
            "Натхнення є? Тоді давай писати тести!",
            "Додай трохи логіки у цей світ. Наступний таск відкрито."
        ]

        const SUBTITLES_DONE = [
            "Ти виконав усі завдання. Справжній джедай!",
            "Zero bugs, zero tasks. Ідеальний стан.",
            "Нічого собі! Твій беклог порожній.",
            "Усі таски закриті. Можна сміливо братися за пет-проєкти.",
            "Все чисто! Ти справжній ніндзя кодингу.",
            "Твоя гілка змерджена, таски закриті. Відпочивай!",
            "Тут більше нічого робити. Ти переміг цей рівень!",
            "Production готовий. Ти молодець!",
            "Можна заварювати чай, ти все виконав.",
            "git push origin main. Всі завдання здані!"
        ]

        setGreetingInfo({
            greeting: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
            subtitleNext: SUBTITLES_NEXT[Math.floor(Math.random() * SUBTITLES_NEXT.length)],
            subtitleDone: SUBTITLES_DONE[Math.floor(Math.random() * SUBTITLES_DONE.length)]
        })
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] overflow-x-hidden font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Header removed in favor of global DynamicHeader */}

            {/* Below header: Sidebar + Main Content (Floating Layout) */}
            <div className="flex p-4 pt-2 gap-4 relative z-10">
                <div className="flex-shrink-0 w-80 rounded-[2rem] overflow-hidden glass-card-premium border border-white/5 shadow-2xl sticky top-[5rem] self-start h-[calc(100vh-6rem)]">
                    <Sidebar
                        tracks={tracks}
                        getTrackProgress={getTrackProgress}
                        selectedTrackId={selectedTrackId}
                        setSelectedTrackId={setSelectedTrackId}
                        isAdmin={isAdmin}
                        role={role}
                        currentPath="/dashboard"
                        overallPct={overallPct}
                    />
                </div>

                {/* Main content Area */}
                <main className="flex-1 glass-card-premium rounded-[2rem] border border-white/5 shadow-2xl relative">
                    {selectedTrack && (
                        <div className="p-8 w-full">
                            {/* Track header */}
                            <div className="mb-12">
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                                                {selectedTrack.title}
                                            </h1>
                                            {isProTrack(selectedTrack.order) && !isAdmin && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-900/40">
                                                    <Star className="w-2.5 h-2.5 fill-current" /> Pro
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-[15px] font-medium max-w-2xl leading-relaxed opacity-60 mt-1">{selectedTrack.description}</p>
                                    </div>

                                    {/* Gamified Stats Widgets */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="glass-card-premium-v2 px-5 py-4 rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center min-w-[110px] shadow-lg shadow-blue-500/5">
                                            <span className="text-3xl font-black text-white tracking-tighter leading-none mb-1.5 text-shadow-sm">5</span>
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] opacity-80">🔥 ДНІВ СТРІКУ</span>
                                        </div>
                                        <div className="glass-card-premium-v2 px-5 py-4 rounded-3xl border border-emerald-500/20 flex flex-col items-center justify-center min-w-[110px] shadow-lg shadow-emerald-500/5">
                                            <span className="text-3xl font-black text-white tracking-tighter leading-none mb-1.5 text-shadow-sm">14</span>
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] opacity-80">🧠 СКІЛІВ</span>
                                        </div>
                                        <div className="glass-card-premium-v2 px-5 py-4 rounded-3xl border border-purple-500/20 flex flex-col items-center justify-center min-w-[110px] shadow-lg shadow-purple-500/5">
                                            <span className="text-3xl font-black text-white tracking-tighter leading-none mb-1.5 text-shadow-sm">1.2k</span>
                                            <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] opacity-80">⌨️ РЯДКІВ КОДУ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Welcome back / Suggested Task */}
                            <div className="mb-10 p-6 glass-card-premium-v2 rounded-[2rem] border border-blue-500/20 shadow-xl shadow-blue-900/20 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-2xl font-black text-white">{greetingInfo.greeting}, {displayFirstName}!</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">{nextTask ? greetingInfo.subtitleNext : greetingInfo.subtitleDone}</p>
                                </div>
                                
                                {nextTask ? (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[300px] z-10 w-full md:w-auto hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex flex-shrink-0 items-center justify-center">
                                            <TargetIcon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Рекомендовано для тебе</p>
                                            <p className="text-white font-bold text-sm truncate max-w-[200px] hover:text-blue-300 transition-colors">
                                                <Link href={`/tasks/${nextTask.id}`}>
                                                    {nextTask.title}
                                                </Link>
                                            </p>
                                        </div>
                                        <Link href={`/tasks/${nextTask.id}`} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                            <ArrowRight className="w-5 h-5 text-white" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 px-6 flex items-center gap-4 z-10 w-full md:w-auto">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        <div>
                                            <p className="text-white font-bold text-sm">Всі завдання виконано!</p>
                                            <p className="text-slate-400 text-xs">Чудова робота.</p>
                                        </div>
                                    </div>
                                )}
                            </div>




                            {filteredTasks.length === 0 ? (
                                <div className="glass-panel rounded-3xl p-16 text-center">
                                    <Code2 className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-400 font-medium">
                                        У цьому рівні поки немає практичних завдань.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-500/50 via-blue-500/10 to-transparent" />
                                        <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">Програма навчання</h2>
                                    </div>
                                    {filteredTasks.map(task => {
                                        const statusLabel = statusMap[task.id] ?? "Не розпочато"
                                        const isDone = statusLabel === "Виконано"
                                        const isInProgress = statusLabel === "В процесі"
                                        const isLocked = isProTrack(selectedTrack.order) && !isAdmin

                                        return (
                                            <Link
                                                key={task.id}
                                                href={isLocked ? "/pricing" : `/tasks/${task.id}`}
                                                className={`group flex items-center gap-8 p-8 glass-card-premium-v2 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 ${isLocked ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : 'active:scale-[0.98] hover:shadow-[0_0_60px_rgba(59,130,246,0.15)] hover:border-white/20'} ${isInProgress && !isLocked ? 'ring-2 ring-blue-500/50' : ''}`}
                                            >
                                                {/* Lesson number background */}
                                                <div className="lesson-number-bg">#{task.order}</div>
                                                {/* In Progress Glow */}
                                                {isInProgress && (
                                                    <div className="absolute inset-0 bg-blue-500/5 blur-xl animate-pulse" />
                                                )}

                                                <div className="relative z-10 flex items-center gap-6 w-full">
                                                    {/* Status indicator */}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone ? "badge-gradient-emerald shadow-lg shadow-emerald-500/20" : isInProgress ? "badge-gradient-blue shadow-lg shadow-blue-500/20" : "bg-white/5 border border-white/10 group-hover:border-white/20"}`}>
                                                        {isDone
                                                            ? <CheckCircle2 className="w-7 h-7 text-white" />
                                                            : isInProgress 
                                                                ? <Clock className="w-7 h-7 text-white" />
                                                                : <div className="w-2 h-2 rounded-full bg-slate-600" />
                                                        }
                                                    </div>

                                                    {/* Task Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 tracking-widest uppercase">РІВЕНЬ {selectedTrack.order} • ЗАВДАННЯ #{task.order}</span>
                                                                {/* Skill Tags */}
                                                                <div className="flex gap-1.5 ml-2">
                                                                    {task.type === 'code' && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-tighter">DOM</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('selector') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-tighter">Locators</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('hook') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Hooks</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('api') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-tighter">API</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_COLORS[task.difficulty ?? "easy"]}`} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`font-bold text-lg transition-colors ${isDone ? "text-slate-500" : "text-white group-hover:text-blue-300"}`}>
                                                                {task.title}
                                                            </h4>
                                                            {isLocked && !isDone && (
                                                                <Lock className="w-4 h-4 text-amber-500/80 star-gold-premium drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status badge */}
                                                    <span className={`hidden sm:flex shrink-0 ${isDone ? 'status-done-glass' : isInProgress ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest' : 'border-white/5 text-slate-500 bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest'}`}>
                                                        {statusLabel}
                                                    </span>

                                                    <div className="p-2 rounded-lg group-hover:bg-white/10 transition-all">
                                                        <ChevronRight className={`w-5 h-5 transition-all ${isDone ? 'text-slate-600' : 'text-slate-400 group-hover:text-white group-hover:translate-x-0.5'}`} />
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>{/* end sidebar+main row */}

            {/* Contacts Prompt Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
                        
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                            <Bell className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Для зворотного зв'язку</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Залиште свій Telegram або WhatsApp. Ментор надішле вам повідомлення, коли перевірить ваші завдання.
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="telegram-input">Telegram</label>
                                <input
                                    id="telegram-input"
                                    type="text"
                                    placeholder="@username або номер"
                                    value={contactForm.telegram}
                                    onChange={(e) => setContactForm({ ...contactForm, telegram: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="whatsapp-input">WhatsApp</label>
                                <input
                                    id="whatsapp-input"
                                    type="text"
                                    placeholder="+380 XX XXX XX XX"
                                    value={contactForm.whatsapp}
                                    onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSkipContacts}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
                            >
                                Пізніше
                            </button>
                            <button
                                type="button"
                                disabled={isSavingContacts || (!contactForm.telegram && !contactForm.whatsapp)}
                                onClick={handleSaveContacts}
                                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                            >
                                {isSavingContacts ? "Збереження..." : "Зберегти"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
