"use client"
import { useLocale, useTranslations } from 'next-intl';

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    BookOpen, Code2, Info, X, ExternalLink, ArrowRight, CheckCircle2, Clock, ChevronRight, GraduationCap, AlertTriangle, FileCode2, HelpCircle,
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

type TaskStatus = "completed" | "pending" | "rejected" | "in_progress" | "not_started"

interface Props {
    tracks: Track[]
    tasks: Task[]
    statusMap: Record<number, TaskStatus>
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
    realStreak?: number
    realLinesOfCode?: number
    pendingReviewCount?: number
    rejectedCount?: number
    hasPracticeAccess?: boolean
    hasInterviewAccess?: boolean
    isSubscriptionExpired?: boolean
    subscriptionExpiresAt?: Date | null
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



export default function DashboardClient({
 tracks, tasks, statusMap, isAdmin, userName, userImage, firstName, hasContacts, projects, role, userId, botUsername, realStreak, realLinesOfCode, pendingReviewCount, rejectedCount, hasPracticeAccess, hasInterviewAccess, isSubscriptionExpired, subscriptionExpiresAt }: Props) {

  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';

  const getTrackDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';
  const getTaskDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';


    const searchParams = useSearchParams()
    const urlTrackId = searchParams.get("trackId")
    const [showRulesModal, setShowRulesModal] = useState(false)
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
        const done = tTasks.filter(t => statusMap[t.id] === "completed").length
        return { done, total: tTasks.length }
    }

    const filteredTasks = trackTasks

    // Extract level number from track title (e.g. "Рівень 2 — ..." -> 2)
    const getLevelNum = (title: string, order: number | null) => {
        const match = title.match(/(?:[Рр][іи]вень|[Уу]ровень|Level)\s*(\d+)/i)
        return match ? parseInt(match[1]) : (order ?? 0)
    }

    const isProTrack = (order: number | null, title?: string) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 2
        return getLevelNum(title ?? "", order) > maxOrder
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0
    
    const displayFirstName = firstName || (userName ? userName.split(' ')[0] : t('student'))
    const displayStreak = realStreak !== undefined ? realStreak : (totalDone > 0 ? totalDone : 0)
    const displaySkills = totalDone
    const displayLines = realLinesOfCode !== undefined 
        ? (realLinesOfCode > 999 ? `${(realLinesOfCode / 1000).toFixed(1)}k` : `${realLinesOfCode}`)
        : (totalDone > 0 ? (totalDone > 30 ? `${(totalDone * 0.04).toFixed(1)}k` : `${totalDone * 85}`) : "0")
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

        const inProgress = unlockedTasks.find(t => statusMap[t.id] === "in_progress")
        if (inProgress) return inProgress

        return unlockedTasks.find(t => statusMap[t.id] === "not_started")
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
        <div className="flex flex-col min-h-screen bg-background font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Header removed in favor of global DynamicHeader */}

            {/* Below header: Sidebar + Main Content (Floating Layout) */}
            <div className="flex px-4 pt-3 lg:pt-4 pb-4 gap-4 relative z-10 w-full max-w-[1600px] mx-auto">
                <div className="flex-shrink-0 w-80 rounded-[2rem] overflow-hidden glass-card-premium border border-white/5 shadow-2xl sticky top-[4.75rem] self-start h-[calc(100vh-5.5rem)]">
                    <Sidebar
                        tracks={tracks}
                        getTrackProgress={getTrackProgress}
                        selectedTrackId={selectedTrackId}
                        setSelectedTrackId={setSelectedTrackId}
                        isAdmin={isAdmin}
                        role={role}
                        currentPath="/dashboard"
                        overallPct={overallPct}
                        hasPracticeAccess={hasPracticeAccess}
                        hasInterviewAccess={hasInterviewAccess}
                        isSubscriptionExpired={isSubscriptionExpired}
                        subscriptionExpiresAt={subscriptionExpiresAt}
                    />
                </div>

                {/* Main content Area */}
                <main className="flex-1 glass-card-premium rounded-3xl border border-white/5 shadow-2xl relative min-w-0">
                    {/* Subscription Expired Alert Banner */}
                    {isSubscriptionExpired && (
                        <div className="mx-6 sm:mx-8 mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">
                                        {locale === 'en' ? "Your Pro subscription has ended" : locale === 'ru' ? "Ваша подписка Pro завершилась" : "Ваша підписка Pro закінчилася"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {locale === 'en' ? "All your progress, code solutions, and certificates are safely preserved. Renew to unlock levels 4–10, interview simulator, and mentor reviews." :
                                         locale === 'ru' ? "Весь ваш прогресс и сертификаты сохранены. Продлите подписку, чтобы разблокировать уровни 4–10, симулятор собеседований и проверку ментора." :
                                         "Весь ваш прогрес, написаний код та сертифікати збережено! Поновіть підписку, щоб розблокувати рівні 4–10, симулятор співбесід та рев'ю ментора."}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/pricing"
                                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {locale === 'en' ? "Renew Pro" : locale === 'ru' ? "Продлить Pro" : "Поновити Pro"}
                            </Link>
                        </div>
                    )}
                    {selectedTrack && (
                        <div className="p-6 sm:p-8 w-full">
                            {/* Track header */}
                            <div className="mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-500 dark:text-blue-400 tracking-wider uppercase">
                                                {getTrackTitle(selectedTrack).split(' — ')[0] || t("moduleDefault")}
                                            </span>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {trackTasks.length} {t("lessonsCount")} • {getTrackProgress(selectedTrack.id).done} {t("lessonsDone")}
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

                                    {/* Gamified Stats Widgets & Mentor Accountability */}
                                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                                        {/* 1. Streak Widget with Tooltip */}
                                        <div className="group relative glass-card-premium-v2 px-3 py-2.5 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 flex flex-col items-center justify-center min-w-[85px] sm:min-w-[95px] shadow-sm cursor-help transition-all">
                                            <span className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none mb-1">{displayStreak}</span>
                                            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider">🔥 {getStreakText(displayStreak)}</span>

                                            {/* Hover Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left scale-95 group-hover:scale-100">
                                                <p className="text-xs font-black text-white flex items-center gap-1.5 mb-1">
                                                    {t("ruleStreakTitle")}
                                                </p>
                                                <p className="text-[11px] text-slate-300 leading-snug mb-2">
                                                    {t("ruleStreakDesc")}
                                                </p>
                                                <div className="pt-1.5 border-t border-white/10 text-[10px] text-amber-400 font-semibold leading-tight">
                                                    ⚠️ {t("ruleStreakRule")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Skills Widget with Tooltip */}
                                        <div className="group relative glass-card-premium-v2 px-3 py-2.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 flex flex-col items-center justify-center min-w-[85px] sm:min-w-[95px] shadow-sm cursor-help transition-all">
                                            <span className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none mb-1">{displaySkills}</span>
                                            <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">🧠 {t("skills")}</span>

                                            {/* Hover Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left scale-95 group-hover:scale-100">
                                                <p className="text-xs font-black text-white flex items-center gap-1.5 mb-1">
                                                    {t("ruleSkillsTitle")}
                                                </p>
                                                <p className="text-[11px] text-slate-300 leading-snug mb-2">
                                                    {t("ruleSkillsDesc")}
                                                </p>
                                                <div className="pt-1.5 border-t border-white/10 text-[10px] text-emerald-400 font-semibold leading-tight">
                                                    🛡️ {t("ruleSkillsRule")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Lines of Code Widget with Tooltip */}
                                        <div className="group relative glass-card-premium-v2 px-3 py-2.5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 flex flex-col items-center justify-center min-w-[85px] sm:min-w-[95px] shadow-sm cursor-help transition-all">
                                            <span className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none mb-1">{displayLines}</span>
                                            <span className="text-[9px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-wider">⌨️ {t("linesOfCode")}</span>

                                            {/* Hover Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left scale-95 group-hover:scale-100">
                                                <p className="text-xs font-black text-white flex items-center gap-1.5 mb-1">
                                                    {t("ruleLinesTitle")}
                                                </p>
                                                <p className="text-[11px] text-slate-300 leading-snug mb-2">
                                                    {t("ruleLinesDesc")}
                                                </p>
                                                <div className="pt-1.5 border-t border-white/10 text-[10px] text-purple-400 font-semibold leading-tight">
                                                    💼 {t("ruleLinesRule")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Mentor Accountability Control Widget */}
                                        <div className={`group relative glass-card-premium-v2 px-3 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[85px] sm:min-w-[100px] shadow-sm cursor-help transition-all ${
                                            (rejectedCount ?? 0) > 0
                                                ? 'border-amber-500/50 bg-amber-500/10 shadow-amber-500/10'
                                                : (pendingReviewCount ?? 0) > 0
                                                    ? 'border-cyan-500/40 bg-cyan-500/5'
                                                    : 'border-emerald-500/20'
                                        }`}>
                                            <span className={`text-xl sm:text-2xl font-black tracking-tighter leading-none mb-1 ${
                                                (rejectedCount ?? 0) > 0
                                                    ? 'text-amber-500'
                                                    : (pendingReviewCount ?? 0) > 0
                                                        ? 'text-cyan-400'
                                                        : 'text-foreground'
                                            }`}>
                                                {(rejectedCount ?? 0) > 0 ? rejectedCount : (pendingReviewCount ?? 0) > 0 ? pendingReviewCount : 0}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                (rejectedCount ?? 0) > 0
                                                    ? 'text-amber-500'
                                                    : (pendingReviewCount ?? 0) > 0
                                                        ? 'text-cyan-400'
                                                        : 'text-emerald-500 dark:text-emerald-400'
                                            }`}>
                                                {(rejectedCount ?? 0) > 0
                                                    ? `⚠️ ${t("mentorNeedsFix")}`
                                                    : (pendingReviewCount ?? 0) > 0
                                                        ? `⏳ ${t("mentorInReview")}`
                                                        : `🛡️ ${t("mentorNoDebts")}`}
                                            </span>

                                            {/* Hover Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left scale-95 group-hover:scale-100">
                                                <p className="text-xs font-black text-white flex items-center gap-1.5 mb-1">
                                                    {t("ruleMentorTitle")}
                                                </p>
                                                <p className="text-[11px] text-slate-300 leading-snug mb-2">
                                                    {t("ruleMentorDesc")}
                                                </p>
                                                <div className="pt-1.5 border-t border-white/10 text-[10px] text-amber-400 font-semibold leading-tight">
                                                    ⚡ {t("ruleMentorRule")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Info Button to Open Full Accountability Modal */}
                                        <button
                                            type="button"
                                            onClick={() => setShowRulesModal(true)}
                                            className="p-2.5 rounded-2xl glass-card-premium-v2 border border-white/10 hover:border-blue-500/30 text-muted-foreground hover:text-foreground transition-all shadow-sm flex items-center justify-center group"
                                            title={t("howGradingWorks")}
                                        >
                                            <Info className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                        </button>
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
                                                {t("workflowTitle")}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">{t("workflowSubtitle")}</p>
                                        </div>
                                    </div>
                                    <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        ⚡ {t("mentorReviewMandatory")}
                                    </span>
                                </div>

                                {/* 4 Steps Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    {/* Step 1 */}
                                    <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 dark:text-blue-400 font-black text-xs flex items-center justify-center">1</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("workflowStep1Tag")}</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">{t("workflowStep1Title")}</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {t("workflowStep1Desc")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">2</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("workflowStep2Tag")}</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">{t("workflowStep2Title")}</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {t("workflowStep2Desc")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 font-black text-xs flex items-center justify-center">3</span>
                                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t("workflowStep3Tag")}</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">{t("workflowStep3Title")}</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {t("workflowStep3Desc")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/30 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-black text-xs flex items-center justify-center">4</span>
                                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t("workflowStep4Tag")}</span>
                                            </div>
                                            <p className="font-bold text-xs text-foreground mb-1">{t("workflowStep4Title")}</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {t("workflowStep4Desc")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Milestone Certificate Goal Card */}
                            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                                        🎓
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                                {t("nextMilestone")}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/20">
                                                {(selectedTrack?.order ?? 1) <= 3 
                                                    ? t("levelsRange03") 
                                                    : (selectedTrack?.order ?? 1) <= 7 
                                                        ? t("levelsRange47") 
                                                        : t("levelsRange810")}
                                            </span>
                                        </div>
                                        <h4 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                                            {(selectedTrack?.order ?? 1) <= 3
                                                ? (locale === "en" ? "Playwright Certified Associate (Junior)" : locale === "ru" ? "Playwright Certified Associate (Junior)" : "Playwright Certified Associate (Junior)")
                                                : (selectedTrack?.order ?? 1) <= 7
                                                    ? (locale === "en" ? "Playwright Automation Specialist (Middle)" : locale === "ru" ? "Playwright Automation Specialist (Middle)" : "Playwright Automation Specialist (Middle)")
                                                    : (locale === "en" ? "Playwright Lead Architect (Senior)" : locale === "ru" ? "Playwright Lead Architect (Senior)" : "Playwright Lead Architect (Senior)")}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {t("milestoneDesc")}
                                        </p>

                                        {/* 3-Tier Visual Scale Stepper */}
                                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40 flex-wrap">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mr-1">Шкала:</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${(selectedTrack?.order ?? 1) <= 3 ? 'bg-blue-600 text-white shadow-sm' : 'bg-secondary text-muted-foreground'}`}>
                                                1. Associate (0-3)
                                            </span>
                                            <span className="text-muted-foreground text-xs">→</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${(selectedTrack?.order ?? 1) > 3 && (selectedTrack?.order ?? 1) <= 7 ? 'bg-purple-600 text-white shadow-sm' : 'bg-secondary text-muted-foreground'}`}>
                                                2. Specialist (4-7)
                                            </span>
                                            <span className="text-muted-foreground text-xs">→</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${(selectedTrack?.order ?? 1) > 7 ? 'bg-amber-600 text-white shadow-sm' : 'bg-secondary text-muted-foreground'}`}>
                                                3. Architect (8-10)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                                    <Link
                                        href="/verify/sample"
                                        target="_blank"
                                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                                    >
                                        <span>{t("viewSample")}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                    <Link
                                        href="/cabinet?tab=certificates"
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
                                    >
                                        {t("myCertificates")} →
                                    </Link>
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
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredTasks.length} {t("tasksCountLabel")}</span>
                                    </div>

                                    {filteredTasks.map((task, idx) => {
                                        const statusLabel = statusMap[task.id] ?? "not_started"
                                        const isDone = statusLabel === "completed"
                                        const isPending = statusLabel === "pending"
                                        const isRejected = statusLabel === "rejected"
                                        const isInProgress = statusLabel === "in_progress"
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
                                                            <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_COLORS[task.difficulty ?? "easy"]}`} title={task.difficulty === "hard" ? t("difficultyHard") : task.difficulty === "medium" ? t("difficultyMedium") : t("difficultyEasy")} />
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
                                                            ? t("statusApproved") 
                                                            : isPending 
                                                                ? t("statusInReview") 
                                                                : isRejected 
                                                                    ? t("statusNeedsFix") 
                                                                    : isInProgress 
                                                                        ? t("statusInProgressNeedsReview") 
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
        
            {/* Student Accountability Modal */}
            {showRulesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                    Playwright Standards
                                </span>
                                <h2 className="text-xl sm:text-2xl font-black text-foreground mt-2 tracking-tight">
                                    {t("rulesModalTitle")}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    {t("rulesModalSubtitle")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRulesModal(false)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 4 Pillars */}
                        <div className="space-y-4 mb-6">
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex gap-3.5">
                                <div className="text-2xl">🔥</div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">{t("ruleStreakTitle")}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-1">{t("ruleStreakDesc")}</p>
                                    <p className="text-[11px] text-blue-400 font-semibold">{t("ruleStreakRule")}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex gap-3.5">
                                <div className="text-2xl">🧠</div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">{t("ruleSkillsTitle")}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-1">{t("ruleSkillsDesc")}</p>
                                    <p className="text-[11px] text-emerald-400 font-semibold">{t("ruleSkillsRule")}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex gap-3.5">
                                <div className="text-2xl">⌨️</div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">{t("ruleLinesTitle")}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-1">{t("ruleLinesDesc")}</p>
                                    <p className="text-[11px] text-purple-400 font-semibold">{t("ruleLinesRule")}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex gap-3.5">
                                <div className="text-2xl">🛡️</div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">{t("ruleMentorTitle")}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-1">{t("ruleMentorDesc")}</p>
                                    <p className="text-[11px] text-amber-400 font-semibold">{t("ruleMentorRule")}</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Close */}
                        <button
                            type="button"
                            onClick={() => setShowRulesModal(false)}
                            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
                        >
                            {t("gotIt")}
                        </button>
                    </div>
                </div>
            )}
</div>
    )
}
