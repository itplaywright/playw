"use client"
import { useLocale, useTranslations } from 'next-intl';

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    BookOpen, Code2, ArrowRight, CheckCircle2, Clock, ChevronRight, GraduationCap, AlertTriangle, FileCode2, HelpCircle,
    BarChart2, Terminal, Layers, Star, Lock, Bell, User, Settings, Search, LayoutGrid, Sparkles, Target as TargetIcon
} from "lucide-react"

import Sidebar from "@/components/layout/Sidebar"

interface Task {
    id: number
    title: string
    numbering: string | null
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
    label: "Виконано" | "На перевірці" | "На доопрацюванні" | "В процесі" | "Не розпочато"
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
    userId?: string
    botUsername?: string
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

export default function DashboardClient({
 tracks, tasks, statusMap, isAdmin, userName, userImage, firstName, hasContacts, projects, role, userId, botUsername }: Props) {

  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';

  const getTrackDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';
  const getTaskDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';


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

    // Extract level number from track title (e.g. "Рівень 2 — ..." -> 2)
    const getLevelNum = (title: string, order: number | null) => {
        const match = title.match(/[Рр][іи]вень\s*(\d+)/)
        return match ? parseInt(match[1]) : (order ?? 0)
    }

    const isProTrack = (order: number | null, title?: string) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 1
        return getLevelNum(title ?? "", order) > maxOrder
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0
    
    const displayFirstName = firstName || (userName ? userName.split(' ')[0] : t('student'))
    const displayStreak = totalDone > 0 ? Math.min(totalDone, 14) : 5
    const displaySkills = totalDone > 0 ? totalDone : 14
    const displayLines = totalDone > 0 ? (totalDone > 30 ? `${(totalDone * 0.04).toFixed(1)}k` : `${totalDone * 85}`) : "1.2k"
    const initials = displayFirstName.substring(0, 2).toUpperCase()

    const getStreakText = (num: number) => {
        if (locale === 'en') return num === 1 ? 'DAY STREAK' : 'DAYS STREAK'
        if (locale === 'ru') {
            const n = Math.abs(num) % 100
            const n1 = n % 10
            if (n > 10 && n < 20) return 'ДНЕЙ СТРИКА'
            if (n1 > 1 && n1 < 5) return 'ДНЯ СТРИКА'
            if (n1 === 1) return 'ДЕНЬ СТРИКА'
            return 'ДНЕЙ СТРИКА'
        }
        const n = Math.abs(num) % 100
        const n1 = n % 10
        if (n > 10 && n < 20) return 'ДНІВ СТРІКУ'
        if (n1 > 1 && n1 < 5) return 'ДНІ СТРІКУ'
        if (n1 === 1) return 'ДЕНЬ СТРІКУ'
        return 'ДНІВ СТРІКУ'
    }

    const getTaskBadges = (task: Task, track: Track | undefined) => {
        const title = (task.title || '').toLowerCase()
        const desc = (task.description || '').toLowerCase()
        const text = `${title} ${desc}`
        const badges: { label: string; color: string }[] = []

        if (task.type === 'quiz') {
            badges.push({ label: 'Quiz', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' })
            return badges
        }

        const trackTitle = (track?.title || '').toLowerCase()
        const isTsTrack = trackTitle.includes('typescript') || trackTitle.includes('рівень 0')

        if (isTsTrack || text.includes('const') || text.includes('let') || text.includes('типи') || text.includes('type') || text.includes('interface') || text.includes('function') || text.includes('string') || text.includes('number')) {
            badges.push({ label: 'TypeScript', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' })
        }

        if (text.includes('locator') || text.includes('selector') || text.includes('getby') || text.includes('селектор') || text.includes('локатор')) {
            badges.push({ label: 'Locators', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' })
        }

        if (text.includes('expect') || text.includes('tohave') || text.includes('tobe') || text.includes('assert') || text.includes('перевірк')) {
            badges.push({ label: 'Assertions', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' })
        }

        if (text.includes('click') || text.includes('fill') || text.includes('press') || text.includes('дії') || text.includes('action')) {
            badges.push({ label: 'Actions', color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' })
        }

        if (text.includes('api') || text.includes('endpoint') || text.includes('http') || text.includes('request')) {
            badges.push({ label: 'API', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' })
        }

        if (text.includes('hook') || text.includes('beforeeach') || text.includes('aftereach') || text.includes('fixture')) {
            badges.push({ label: 'Hooks', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' })
        }

        if (badges.length === 0) {
            if (isTsTrack) {
                badges.push({ label: 'Basics', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' })
            } else {
                badges.push({ label: 'Playwright', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' })
            }
        }

        return badges.slice(0, 2)
    }

    // Find next suggested task
    const findNextTask = () => {
        const unlockedTasks = tasks.filter(t => {
            const track = tracks.find(tr => tr.id === t.trackId)
            return track && (!isProTrack(track.order, getTrackTitle(track)) || isAdmin)
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
    const getTaskLabel = (title: string, order: number | null) => {
        const match = title.match(/^(\d+(\.\d+)*)/)
        return match ? match[1] : (order ?? 1)
    }

    // Contact Modal Logic
    const [showContactModal, setShowContactModal] = useState(false)

    useEffect(() => {
        const storageKey = `contacts_prompted_${userName || 'unknown'}`
        if (hasContacts === false && !localStorage.getItem(storageKey)) {
            // Slight delay so the user sees the dashboard first
            const timer = setTimeout(() => setShowContactModal(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [hasContacts, userName])

    const handleSkipContacts = () => {
        const storageKey = `contacts_prompted_${userName || 'unknown'}`
        localStorage.setItem(storageKey, "true")
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

        const localizedGreetings = [
            t("greeting1"),
            t("greeting2"),
            t("greeting3"),
            t("greeting4"),
            t("greeting5"),
        ]
        const localizedNext = [
            t("subtitleNext1"),
            t("subtitleNext2"),
            t("subtitleNext3"),
        ]
        const localizedDone = [
            t("subtitleDone1"),
            t("subtitleDone2"),
            t("subtitleDone3"),
        ]
        setGreetingInfo({
            greeting: localizedGreetings[Math.floor(Math.random() * localizedGreetings.length)],
            subtitleNext: localizedNext[Math.floor(Math.random() * localizedNext.length)],
            subtitleDone: localizedDone[Math.floor(Math.random() * localizedDone.length)]
        })
    }, [t])

    return (
        <div className="flex flex-col min-h-screen bg-background overflow-x-hidden font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Header removed in favor of global DynamicHeader */}

            {/* Below header: Sidebar + Main Content (Floating Layout) */}
            <div className="flex px-4 pt-6 pb-4 gap-4 relative z-10 w-full max-w-[1600px] mx-auto">
                <div className="flex-shrink-0 w-80 rounded-[2rem] overflow-hidden glass-card-premium border border-white/5 shadow-2xl sticky top-4 self-start h-[calc(100vh-5rem)] -mt-6 lg:-mt-10">
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
                <main className="flex-1 glass-card-premium rounded-3xl border border-white/5 shadow-2xl relative">
                    {selectedTrack && (
                        <div className="p-6 sm:p-8 w-full">
                            {/* Track header */}
                            <div className="mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-500 dark:text-blue-400 tracking-wider uppercase">
                                                {getTrackTitle(selectedTrack).split(' — ')[0] || 'Модуль'}
                                            </span>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {trackTasks.length} {locale === 'en' ? 'lessons' : 'уроків'} • {getTrackProgress(selectedTrack.id).done} виконано
                                            </span>
                                            {isProTrack(selectedTrack.order) && !isAdmin && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-900/30">
                                                    <Star className="w-2.5 h-2.5 fill-current" /> {t("proBadge")}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                                            {getTrackTitle(selectedTrack)}
                                        </h1>
                                        <p className="text-muted-foreground text-sm font-normal max-w-2xl leading-relaxed mt-2 opacity-80">{getTrackDesc(selectedTrack)}</p>
                                    </div>

                                    {/* Gamified Stats Widgets */}
                                    <div className="flex items-center gap-2.5 sm:gap-3">
                                        <div className="glass-card-premium-v2 px-4 py-3 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center min-w-[95px] sm:min-w-[105px] shadow-sm">
                                            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none mb-1">{displayStreak}</span>
                                            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider">🔥 {getStreakText(displayStreak)}</span>
                                        </div>
                                        <div className="glass-card-premium-v2 px-4 py-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center min-w-[95px] sm:min-w-[105px] shadow-sm">
                                            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none mb-1">{displaySkills}</span>
                                            <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">🧠 {t("skills")}</span>
                                        </div>
                                        <div className="glass-card-premium-v2 px-4 py-3 rounded-2xl border border-purple-500/20 flex flex-col items-center justify-center min-w-[95px] sm:min-w-[105px] shadow-sm">
                                            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none mb-1">{displayLines}</span>
                                            <span className="text-[9px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-wider">⌨️ {t("linesOfCode")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Welcome back / Suggested Task */}
                            <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/[0.08] via-indigo-600/[0.04] to-transparent flex flex-col md:flex-row items-center gap-5 justify-between relative overflow-hidden shadow-lg shadow-blue-500/5">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{greetingInfo.greeting}, {displayFirstName}!</h3>
                                    </div>
                                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">{nextTask ? greetingInfo.subtitleNext : greetingInfo.subtitleDone}</p>
                                </div>
                                
                                {nextTask ? (
                                    <div className="bg-card/80 backdrop-blur-sm border border-border/80 hover:border-blue-500/40 rounded-xl p-3 sm:p-3.5 flex items-center gap-3.5 min-w-[280px] sm:min-w-[320px] z-10 w-full md:w-auto transition-all shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex flex-shrink-0 items-center justify-center">
                                            <TargetIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-0.5">{t("recommendedForYou")}</p>
                                            <p className="text-foreground font-bold text-xs sm:text-sm truncate">
                                                <Link href={`/tasks/${nextTask.id}`} className="hover:text-blue-500 transition-colors">
                                                    {getTaskTitle(nextTask)}
                                                </Link>
                                            </p>
                                        </div>
                                        <Link href={`/tasks/${nextTask.id}`} className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-transform active:scale-95 shadow-md shadow-blue-600/30 flex-shrink-0">
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-card/80 border border-emerald-500/30 rounded-xl p-3 px-5 flex items-center gap-3 z-10 w-full md:w-auto">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                                        <div>
                                            <p className="text-foreground font-bold text-xs sm:text-sm">{t("allTasksCompleted")}</p>
                                            <p className="text-muted-foreground text-[11px]">{t("greatJob")}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Comprehensive Student Workflow Guide */}
                            <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-950/20 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 dark:text-blue-400">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                                                🧭 Як проходить навчання та зарахування завдань
                                            </h3>
                                            <p className="text-xs text-muted-foreground">Пройдіть 4 обов'язкові кроки для зарахування кожного уроку</p>
                                        </div>
                                    </div>
                                    <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        ⚡ Рев'ю ментора обов'язкове
                                    </span>
                                </div>

                                {/* 4 Steps Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    {/* Step 1 */}
                                    <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 dark:text-blue-400 font-black text-xs flex items-center justify-center">1</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Теорія</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">Ознайомтеся з темою</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Читайте теорію, офіційну документацію Playwright та розбір методів зліва в уроці.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">2</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Практика</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">Напишіть автотест</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Пишіть код у вбудованому редакторі та перевіряйте його симулятором через <kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">Ctrl+Enter</kbd>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 font-black text-xs flex items-center justify-center">3</span>
                                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Головне</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">Відправте ментору</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Натисніть <strong>«Відправити ментору»</strong>. Без перевірки ментором завдання не зараховується!
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/30 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-black text-xs flex items-center justify-center">4</span>
                                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Зарахування</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">Фідбек та оцінка</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Отримайте розбір коду в кабінеті (та Telegram) і статус <strong>«Зараховано ментором»</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filteredTasks.length === 0 ? (
                                <div className="glass-panel rounded-2xl p-16 text-center">
                                    <Code2 className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-400 font-medium">
                                        {t("noTasksInLevel")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.25em] whitespace-nowrap">{t("curriculum")}</h2>
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-border via-border/50 to-transparent" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredTasks.length} {locale === 'en' ? 'TASKS' : 'ЗАВДАНЬ'}</span>
                                    </div>

                                    {filteredTasks.map((task, idx) => {
                                        const statusLabel = statusMap[task.id] ?? "Не розпочато"
                                        const isDone = statusLabel === "Виконано"
                                        const isPending = statusLabel === "На перевірці"
                                        const isRejected = statusLabel === "На доопрацюванні"
                                        const isInProgress = statusLabel === "В процесі"
                                        const isLocked = isProTrack(selectedTrack.order, getTrackTitle(selectedTrack)) && !isAdmin
                                        const badges = getTaskBadges(task, selectedTrack)
                                        const taskIndexFormatted = task.numbering || `#${idx + 1}`

                                        return (
                                            <Link
                                                key={task.id}
                                                href={isLocked ? "/pricing" : `/tasks/${task.id}`}
                                                className={`group flex items-center gap-4 sm:gap-6 p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                                                    isDone
                                                        ? 'bg-card/40 border-border/40 hover:bg-card/70 hover:border-emerald-500/30'
                                                        : isPending
                                                            ? 'bg-gradient-to-r from-amber-500/[0.08] via-card to-card border-amber-500/40 shadow-md shadow-amber-500/5'
                                                            : isRejected
                                                                ? 'bg-gradient-to-r from-rose-500/[0.08] via-card to-card border-rose-500/40 shadow-md shadow-rose-500/5'
                                                                : isInProgress && !isLocked
                                                                    ? 'bg-gradient-to-r from-blue-500/[0.08] via-card to-card border-blue-500/40 shadow-lg shadow-blue-500/5'
                                                                    : 'bg-card/50 border-border/50 hover:bg-card/90 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5'
                                                } ${isLocked ? 'opacity-50 grayscale hover:opacity-90 hover:grayscale-0' : 'active:scale-[0.99]'}`}
                                            >
                                                {/* Status Left Accent Bar */}
                                                {isPending && !isLocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
                                                {isRejected && !isLocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                                                {isInProgress && !isLocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}

                                                {/* Lesson number background */}
                                                <div className="lesson-number-bg">#{task.order || idx + 1}</div>

                                                <div className="relative z-10 flex items-center gap-4 sm:gap-5 w-full">
                                                    {/* Status indicator */}
                                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                                        isDone 
                                                            ? "badge-gradient-emerald shadow-md shadow-emerald-500/20" 
                                                            : isPending
                                                                ? "bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 ring-2 ring-amber-500/20 ring-offset-2 ring-offset-background"
                                                                : isRejected
                                                                    ? "bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 ring-2 ring-rose-500/20 ring-offset-2 ring-offset-background"
                                                                    : isInProgress 
                                                                        ? "badge-gradient-blue shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-background" 
                                                                        : "bg-secondary/60 border border-border/60 group-hover:border-blue-500/30"
                                                    }`}>
                                                        {isDone ? (
                                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                                        ) : isPending ? (
                                                            <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                                        ) : isRejected ? (
                                                            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                                        ) : isInProgress ? (
                                                            <FileCode2 className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <span className="text-xs font-black text-muted-foreground group-hover:text-foreground">
                                                                {String(idx + 1).padStart(2, '0')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Task Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                                                                {getTrackTitle(selectedTrack).split(' — ')[0]} • {taskIndexFormatted}
                                                            </span>
                                                            {badges.map((b, i) => (
                                                                <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${b.color}`}>
                                                                    {b.label}
                                                                </span>
                                                            ))}
                                                            <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_COLORS[task.difficulty ?? "easy"]}`} title={DIFFICULTY_LABELS[task.difficulty ?? "easy"]} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`font-bold text-base sm:text-lg transition-colors truncate ${isDone ? "text-muted-foreground" : "text-foreground group-hover:text-blue-500 dark:group-hover:text-blue-300"}`}>
                                                                {getTaskTitle(task)}
                                                            </h4>
                                                            {isLocked && !isDone && (
                                                                <Lock className="w-3.5 h-3.5 text-amber-500/80 star-gold-premium drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status badge */}
                                                    <span className={`hidden sm:inline-flex shrink-0 ${
                                                        isDone 
                                                            ? 'status-done-glass' 
                                                            : isPending
                                                                ? 'border border-amber-500/30 text-amber-500 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider'
                                                                : isRejected
                                                                    ? 'border border-rose-500/30 text-rose-500 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider'
                                                                    : isInProgress 
                                                                        ? 'border border-blue-500/30 text-blue-500 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider' 
                                                                        : 'border border-border/60 text-muted-foreground/70 bg-secondary/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider'
                                                    }`}>
                                                        {isDone 
                                                            ? "✅ Зараховано ментором" 
                                                            : isPending 
                                                                ? "⏳ На перевірці в ментора" 
                                                                : isRejected 
                                                                    ? "⚠️ Потребує виправлень" 
                                                                    : isInProgress 
                                                                        ? "💻 В процесі (потрібно рев'ю)" 
                                                                        : t("statusNotStarted")
                                                        }
                                                    </span>

                                                    <div className="p-1.5 rounded-lg text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                                                        <ChevronRight className="w-5 h-5" />
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
                        
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t("stayInTouch")}</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            {t("telegramBotDesc")}
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <a 
                                href={`https://t.me/${botUsername || ''}?start=${userId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleSkipContacts} // Also dismiss modal when they click the bot
                                className="flex items-center justify-center gap-3 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl px-4 py-4 text-sm font-bold transition-all shadow-lg shadow-blue-500/30"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                                </svg>
                                {t("connectTelegramBot")}
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSkipContacts}
                                className="w-full py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
                            >
                                {t("remindLater")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
