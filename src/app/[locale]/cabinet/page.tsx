"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import {
    LayoutDashboard, Award, ExternalLink, Lock, MessageCircle, BarChart2, CheckCircle2,
    Clock, Target, Zap, TrendingUp, ChevronRight, ArrowRight,
    User, BookOpen, UserCircle, Phone, Send, Save, Loader2
} from "lucide-react"
import { Link } from "@/i18n/routing"
import Image from "next/image"

type Section = "overview" | "certificates" | "questions" | "progress" | "submissions" | "profile"

interface Stats {
    totalTasks: number
    completedTasks: number
    totalAttempts: number
    successRate: number
    pendingQuestions: number
    trackProgress: { id: number; title: string; order: number; total: number; done: number }[]
}

interface UserProfile {
    id: string
    name: string | null
    email: string | null
    image: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    telegram: string | null
    telegramChatId?: string | null
    whatsapp: string | null
    botUsername?: string
}

export default function UserCabinetPage() {
    const t = useTranslations("Cabinet")
    const locale = useLocale()

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            const loc = locale === 'uk' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-US'
            return d.toLocaleDateString(loc) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } catch {
            return dateStr
        }
    }
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab") as Section | null
    const [section, setSection] = useState<Section>(tabParam && ["overview", "certificates", "progress", "questions", "submissions", "profile"].includes(tabParam) ? tabParam : "overview")

    useEffect(() => {
        if (tabParam && ["overview", "certificates", "progress", "questions", "submissions", "profile"].includes(tabParam)) {
            setSection(tabParam)
        }
    }, [tabParam])
    const [questions, setQuestions] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        telegram: "",
        telegramChatId: "",
        whatsapp: "",
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [certsList, setCertsList] = useState<any[]>([])

    useEffect(() => {
        if (section === "certificates") {
            fetchCertificates()
        }
    }, [section])

    const fetchCertificates = async () => {
        try {
            const res = await fetch("/api/user/certificates")
            if (res.ok) {
                const data = await res.json()
                setCertsList(data.certificates || [])
            }
        } catch (e) {
            console.error("Failed to fetch certs", e)
        }
    }

    useEffect(() => {
        Promise.all([fetchQuestions(), fetchStats(), fetchSubmissions(), fetchProfile(), fetchCertificates()]).finally(() => setIsLoading(false))
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
            toast.error(t("errorLoadQuestions"))
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

    const fetchSubmissions = async () => {
        try {
            const res = await fetch("/api/user/submissions")
            if (res.ok) {
                const data = await res.json()
                setSubmissions(Array.isArray(data) ? data : [])
            }
        } catch {
            console.error("Failed to load submissions")
        }
    }

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile")
            if (res.ok) {
                const data: UserProfile = await res.json()
                setProfile(data)
                setProfileForm({
                    firstName: data.firstName ?? "",
                    lastName: data.lastName ?? "",
                    phone: data.phone ?? "",
                    telegram: data.telegram ?? "",
                    telegramChatId: data.telegramChatId ?? "",
                    whatsapp: data.whatsapp ?? "",
                })
            }
        } catch {
            console.error("Failed to load profile")
        }
    }

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileForm),
            })
            if (res.ok) {
                toast.success(t("profileSaved"))
                await fetchProfile()
            } else {
                toast.error(t("profileSaveError"))
            }
        } catch {
            toast.error(t("connectionError"))
        } finally {
            setIsSavingProfile(false)
        }
    }

    const navItems: { id: Section; label: string; icon: any }[] = [
        { id: "overview", label: t("tabOverview"), icon: LayoutDashboard },
        { id: "certificates", label: t("tabCertificates"), icon: Award },
        { id: "profile", label: t("tabSettings"), icon: UserCircle },
        { id: "progress", label: t("courseProgress"), icon: BarChart2 },
        { id: "questions", label: t("tabQuestions"), icon: MessageCircle },
        { id: "submissions", label: t("tabSubmissions"), icon: CheckCircle2 },
    ]

    const answeredCount = questions.filter(q => q.status === "answered").length
    const pendingCount = questions.filter(q => q.status === "pending").length
    const pendingSubmissionsCount = submissions.filter(s => s.status === "pending").length

    // Compute display name for avatar
    const avatarInitials = (() => {
        const first = profileForm.firstName || profile?.name?.split(" ")[0] || ""
        const last = profileForm.lastName || profile?.name?.split(" ")[1] || ""
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U"
    })()

    return (
        <div className="flex min-h-screen bg-background overflow-x-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
                {/* Logo/User area */}
                <div className="px-6 py-8 border-b border-border">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-foreground font-bold text-sm leading-tight">{t("title")}</p>
                            <p className="text-muted-foreground text-xs font-medium">IT Playwright Platform</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setSection(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${section === id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {id === "questions" && pendingCount > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                            {id === "submissions" && pendingSubmissionsCount > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {pendingSubmissionsCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom link */}
                <div className="px-3 pb-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground text-sm font-bold transition-all group"
                    >
                        <BookOpen className="w-4 h-4" />
                        {t("toLearning")}
                        <ArrowRight className="w-3 h-3 ml-auto transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium text-sm">{t("loadingData")}</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-5xl mx-auto">

                        {/* OVERVIEW */}
                        {section === "overview" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("tabOverview")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("overviewSubtitle")}</p>
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <StatCard
                                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                                        bg="bg-emerald-500/10"
                                        label={t("kpiCompletedTasks")}
                                        value={stats ? `${stats.completedTasks} / ${stats.totalTasks}` : "—"}
                                        sub={stats ? `${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}% ${t("ofCourse")}` : ""}
                                    />
                                    <StatCard
                                        icon={<Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                                        bg="bg-blue-500/10"
                                        label={t("kpiSuccessRate")}
                                        value={stats ? `${stats.successRate}%` : "—"}
                                        sub={stats ? t("ofAttempts", { count: stats.totalAttempts }) : ""}
                                    />
                                    <StatCard
                                        icon={<Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                                        bg="bg-violet-500/10"
                                        label={t("kpiTotalAttempts")}
                                        value={stats ? String(stats.totalAttempts) : "—"}
                                        sub={t("simulationsAndTests")}
                                    />
                                    <StatCard
                                        icon={<MessageCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                                        bg="bg-amber-500/10"
                                        label={t("kpiQuestionsToMentor")}
                                        value={String(questions.length)}
                                        sub={t("receivedAnswers", { count: answeredCount })}
                                    />
                                </div>

                                {/* Course progress bar */}
                                {stats && stats.trackProgress.length > 0 && (
                                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                                        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                            {t("courseProgress")}
                                        </h2>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-muted-foreground text-xs font-medium">{t("courseCompletedPct")}</span>
                                            <span className="font-black text-sm text-foreground">
                                                {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/dashboard" className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-foreground text-sm">{t("continueLearning")}</p>
                                            <p className="text-muted-foreground text-xs font-medium">{t("goToTasksBtn")}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                    </Link>
                                    <button
                                        onClick={() => setSection("questions")}
                                        className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all hover:bg-secondary/30"
                                    >
                                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-foreground text-sm">{t("myQuestions")}</p>
                                            <p className="text-muted-foreground text-xs font-medium">{pendingCount > 0 ? `${pendingCount} ${t("awaitingAnswer")}` : t("allQuestionsAnswered")}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PROFILE */}
                        {section === "profile" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("myProfile")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("myProfileSubtitle")}</p>
                                </div>

                                {/* Avatar card */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6 flex items-center gap-5">
                                    {profile?.image ? (
                                        <Image
                                            src={profile.image}
                                            alt="Avatar"
                                            width={72}
                                            height={72}
                                            className="rounded-2xl object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                            <span className="text-white text-2xl font-black">{avatarInitials}</span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-black text-foreground text-lg leading-tight">
                                            {(profileForm.firstName || profileForm.lastName)
                                                ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
                                                : profile?.name ?? t("defaultUser")}
                                        </p>
                                        <p className="text-muted-foreground text-sm font-medium mt-0.5">{profile?.email}</p>
                                    </div>
                                </div>

                                {/* Form card */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-500" />
                                        {t("personalData")}
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                        <ProfileField
                                            label={t("firstName")}
                                            id="profile-firstName"
                                            placeholder={t("enterFirstName")}
                                            value={profileForm.firstName}
                                            onChange={(v) => setProfileForm(f => ({ ...f, firstName: v }))}
                                        />
                                        <ProfileField
                                            label={t("lastName")}
                                            id="profile-lastName"
                                            placeholder={t("enterLastName")}
                                            value={profileForm.lastName}
                                            onChange={(v) => setProfileForm(f => ({ ...f, lastName: v }))}
                                        />
                                    </div>

                                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-blue-500" />
                                        {t("contactInfo")}
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                                        <ProfileField
                                            label={t("phone")}
                                            id="profile-phone"
                                            placeholder="+380 XX XXX XX XX"
                                            value={profileForm.phone}
                                            onChange={(v) => setProfileForm(f => ({ ...f, phone: v }))}
                                            icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                                        />
                                        {profileForm.telegramChatId ? (
                                            <div className="flex flex-col gap-2">
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Telegram</label>
                                                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    <span className="text-sm font-bold text-emerald-500">{t("botConnected")}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Telegram</label>
                                                <a 
                                                    href={`https://t.me/${profile?.botUsername || ''}?start=${profile?.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl px-4 py-3 text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {t("connectBot")}
                                                </a>
                                            </div>
                                        )}
                                        <ProfileField
                                            label="WhatsApp"
                                            id="profile-whatsapp"
                                            placeholder={t("telegramPlaceholder")}
                                            value={profileForm.whatsapp}
                                            onChange={(v) => setProfileForm(f => ({ ...f, whatsapp: v }))}
                                            icon={
                                                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            id="save-profile-btn"
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            {isSavingProfile ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isSavingProfile ? t("saving") : t("save")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CERTIFICATES */}
                        {section === "certificates" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("certificatesTitle")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("certificatesSubtitle")}</p>
                                </div>

                                {/* Certification Scale / Roadmap */}
                                <div className="mb-8 rounded-3xl bg-card border border-border p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-border/60">
                                        <div>
                                            <h2 className="text-base font-black text-foreground flex items-center gap-2">
                                                <span>🎓</span>
                                                <span>{t("certScaleTitle")}</span>
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                                {t("certScaleSubtitle")}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold self-start sm:self-auto">
                                            <span>3 Тьєри</span>
                                        </div>
                                    </div>

                                    {/* 3 Steps Scale */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                                        {/* Step 1: Associate */}
                                        <div className="rounded-2xl p-4 bg-secondary/40 border border-blue-500/20 flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                                                        {t("tier1Badge")}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-muted-foreground">
                                                        {t("tier1Range")}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-foreground mb-1">
                                                    {t("tier1Title")}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {t("tier1Req")}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {certsList.find((c: any) => c.tier.id === 'associate')?.isUnlocked
                                                        ? t("statusEarned")
                                                        : t("statusInProgress")}
                                                </span>
                                                <span className={`text-xs font-black ${
                                                    certsList.find((c: any) => c.tier.id === 'associate')?.isUnlocked
                                                        ? "text-emerald-400"
                                                        : "text-blue-400"
                                                }`}>
                                                    {certsList.find((c: any) => c.tier.id === 'associate')?.percentage ?? 0}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Step 2: Specialist */}
                                        <div className="rounded-2xl p-4 bg-secondary/40 border border-purple-500/20 flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
                                                        {t("tier2Badge")}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-muted-foreground">
                                                        {t("tier2Range")}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-foreground mb-1">
                                                    {t("tier2Title")}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {t("tier2Req")}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {certsList.find((c: any) => c.tier.id === 'specialist')?.isUnlocked
                                                        ? t("statusEarned")
                                                        : t("statusInProgress")}
                                                </span>
                                                <span className={`text-xs font-black ${
                                                    certsList.find((c: any) => c.tier.id === 'specialist')?.isUnlocked
                                                        ? "text-emerald-400"
                                                        : "text-purple-400"
                                                }`}>
                                                    {certsList.find((c: any) => c.tier.id === 'specialist')?.percentage ?? 0}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Step 3: Architect */}
                                        <div className="rounded-2xl p-4 bg-secondary/40 border border-amber-500/20 flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                                        {t("tier3Badge")}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-muted-foreground">
                                                        {t("tier3Range")}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-foreground mb-1">
                                                    {t("tier3Title")}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {t("tier3Req")}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {certsList.find((c: any) => c.tier.id === 'architect')?.isUnlocked
                                                        ? t("statusEarned")
                                                        : t("statusInProgress")}
                                                </span>
                                                <span className={`text-xs font-black ${
                                                    certsList.find((c: any) => c.tier.id === 'architect')?.isUnlocked
                                                        ? "text-emerald-400"
                                                        : "text-amber-400"
                                                }`}>
                                                    {certsList.find((c: any) => c.tier.id === 'architect')?.percentage ?? 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mentorship Rule banner */}
                                    <div className="mt-5 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center gap-3">
                                        <span className="text-base flex-shrink-0">🛡️</span>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {t("mentorCondition")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 mb-8 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-500/10 border border-blue-500/20 shadow-sm">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
                                            👁️
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{t("sampleNoticeTitle")}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{t("sampleNoticeDesc")}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/verify/sample"
                                        target="_blank"
                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 whitespace-nowrap shadow-sm"
                                    >
                                        <span>{t("viewSample")}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {certsList.map((item: any) => {
                                        const { tier, totalTasks, completedTasks, percentage, isUnlocked, certificate } = item
                                        const isAssociate = tier.id === "associate"
                                        const isSpecialist = tier.id === "specialist"

                                        const badgeBg = isAssociate
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : isSpecialist
                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"

                                        return (
                                            <div
                                                key={tier.id}
                                                className={`relative rounded-3xl border p-6 sm:p-8 transition-all ${
                                                    isUnlocked
                                                        ? "bg-card border-white/20 shadow-xl shadow-blue-500/5 hover:border-blue-500/40"
                                                        : "bg-card/60 border-border/60 opacity-90"
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                                                            isUnlocked
                                                                ? "bg-gradient-to-br " + tier.accentClass + " text-white shadow-blue-500/20"
                                                                : "bg-secondary text-muted-foreground"
                                                        }`}>
                                                            {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeBg}`}>
                                                                    {locale === "en" ? tier.badge : locale === "ru" ? tier.badgeRu : tier.badgeUk}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-semibold">
                                                                    {locale === "en" ? (tier.levelRangeEn || tier.levelRange) : locale === "ru" ? (tier.levelRangeRu || tier.levelRange) : (tier.levelRangeUk || tier.levelRange)}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-black text-foreground tracking-tight">
                                                                {locale === "en" ? tier.title : locale === "ru" ? tier.titleRu : tier.titleUk}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {isUnlocked ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                {t("unlockedStatus")}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-bold">
                                                                {t("lockedNotice")} {Math.max(0, totalTasks - completedTasks)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
                                                    {locale === "en" ? tier.description : locale === "ru" ? tier.descriptionRu : tier.descriptionUk}
                                                </p>

                                                <div className="mb-6 space-y-2">
                                                    <div className="flex justify-between items-center text-xs font-bold">
                                                        <span className="text-muted-foreground">{t("tasksOf", { done: completedTasks, total: totalTasks })}</span>
                                                        <span className={isUnlocked ? "text-emerald-400" : "text-blue-400"}>{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-700 ${
                                                                isUnlocked
                                                                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                                                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {isUnlocked && certificate && (
                                                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                                                        <div className="text-xs font-mono text-muted-foreground">
                                                            ID: <span className="text-foreground font-bold">{certificate.certificateNumber}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                href={`/verify/${certificate.certificateNumber}`}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                                                            >
                                                                <span>{t("viewCertificate")}</span>
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PROGRESS */}
                        {section === "progress" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("levelsProgress")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("levelsProgressSubtitle")}</p>
                                </div>

                                {stats?.trackProgress && stats.trackProgress.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.trackProgress.map((track) => {
                                            const pct = track.total > 0 ? Math.round((track.done / track.total) * 100) : 0
                                            const isDone = pct === 100
                                            return (
                                                <div key={track.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}>
                                                                {track.order}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground text-sm leading-tight">{track.title}</p>
                                                                <p className="text-muted-foreground text-xs font-medium mt-0.5">{t("tasksOf", { done: track.done, total: track.total })}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDone ? "bg-emerald-500/10 text-emerald-500" : pct > 0 ? "bg-blue-500/10 text-blue-500" : "bg-secondary text-muted-foreground"}`}>
                                                            {isDone ? t("completed") : pct > 0 ? t("inProgress") : t("notStarted")}
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className={`h-2.5 rounded-full transition-all duration-700 ${isDone ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <span className="text-xs font-black text-muted-foreground/60 tracking-wider font-mono">{pct}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<BarChart2 className="w-8 h-8 text-muted-foreground" />}
                                        title={t("noDataTitle")}
                                        text={t("noDataDesc")}
                                        href="/dashboard"
                                        cta={t("goToTasks")}
                                    />
                                )}
                            </div>
                        )}

                        {/* QUESTIONS */}
                        {section === "questions" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("tabQuestions")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("emptyQuestionsDesc")}</p>
                                </div>

                                {questions.length === 0 ? (
                                    <EmptyState
                                        icon={<MessageCircle className="w-8 h-8 text-muted-foreground" />}
                                        title={t("emptyQuestionsTitle")}
                                        text={t("emptyQuestionsDesc")}
                                        href="/dashboard"
                                        cta={t("goToTasks")}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {questions.map((q) => (
                                            <div key={q.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDate(q.createdAt)}
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${q.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                                            {q.status === "pending" ? t("statusPending") : t("statusReviewed")}
                                                        </span>
                                                    </div>

                                                    <p className="text-foreground font-bold text-sm leading-relaxed mb-4 italic opacity-90">
                                                        "{q.content}"
                                                    </p>

                                                    {q.status === "answered" ? (
                                                        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">{t("mentorAnswer")}</p>
                                                                    <p className="text-foreground text-sm leading-relaxed">{q.answer}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl border border-border border-dashed">
                                                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                            <p className="text-xs text-muted-foreground font-medium">{t("mentorReplyPending")}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SUBMISSIONS */}
                        {section === "submissions" && (
                            <div>
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t("tabSubmissions")}</h1>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t("subtitle")}</p>
                                </div>

                                {submissions.length === 0 ? (
                                    <EmptyState
                                        icon={<CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                                        title={t("emptySubmissionsTitle")}
                                        text={t("emptySubmissionsDesc")}
                                        href="/dashboard"
                                        cta={t("goToTasks")}
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        {submissions.map((s) => (
                                            <div key={s.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                                                <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-black text-foreground text-lg mb-1 tracking-tight">{s.taskTitle}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDate(s.createdAt)}
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${
                                                        s.status === "pending" ? "bg-amber-500/10 text-amber-500" : 
                                                        s.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                        "bg-emerald-500/10 text-emerald-500"
                                                    }`}>
                                                        {s.status === "pending" ? t("statusPending") : s.status === "rejected" ? t("statusRejected") : t("statusReviewed")}
                                                    </span>
                                                </div>

                                                <div className="p-6 bg-secondary/30 flex flex-col gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{t("yourCode")}</p>
                                                        <div className="bg-[#0d1117] rounded-xl overflow-hidden shadow-inner border border-border">
                                                            <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                                                                <code>{s.code}</code>
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    {s.mentorFeedback ? (
                                                        <div>
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{t("mentorFeedback")}</p>
                                                            <div className={`p-5 rounded-xl border ${
                                                                s.status === 'reviewed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                                                            }`}>
                                                                <div className="prose prose-sm max-w-none text-foreground">
                                                                    <div dangerouslySetInnerHTML={{ __html: s.mentorFeedback.replace(/\n/g, '<br/>') }} />
                                                                </div>
                                                                {s.reviewedAt && (
                                                                    <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5 font-bold">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        {t("reviewedAtTime", { date: new Date(s.reviewedAt).toLocaleDateString(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US"), time: new Date(s.reviewedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-4 bg-card rounded-xl border border-border border-dashed justify-center">
                                                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                            <p className="text-xs text-muted-foreground font-medium">{t("codeAwaitingReview")}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-card border-t border-border flex justify-end">
                                                    <Link
                                                        href={`/tasks/${s.taskId}`}
                                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                                                    >
                                                        {t("backToTask")} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                                    </Link>
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

function ProfileField({
    label, id, placeholder, value, onChange, icon
}: {
    label: string
    id: string
    placeholder: string
    value: string
    onChange: (v: string) => void
    icon?: React.ReactNode
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${icon ? "pl-10" : ""}`}
                />
            </div>
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
