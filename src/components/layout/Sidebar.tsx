"use client"

import { Link } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"
import {
    Terminal, Layers, LayoutGrid, BarChart2, ArrowRight, Lock, Award, Briefcase
} from "lucide-react"

interface Track {
    id: number
    title: string
    titleEn?: string | null
    titleRu?: string | null
    order: number | null
}

interface Role {
    id: number
    name: string
    maxTrackOrder: number | null
}

interface SidebarProps {
    tracks: Track[]
    getTrackProgress: (trackId: number) => { done: number, total: number }
    selectedTrackId?: number
    setSelectedTrackId?: (id: number) => void
    isAdmin: boolean
    role?: Role | null
    currentPath: string
    overallPct?: number
    hasPracticeAccess?: boolean
    hasInterviewAccess?: boolean
    isSubscriptionExpired?: boolean
    subscriptionExpiresAt?: Date | null
}

export default function Sidebar({
    tracks,
    getTrackProgress,
    selectedTrackId,
    setSelectedTrackId,
    isAdmin,
    role,
    currentPath,
    overallPct,
    hasPracticeAccess,
    hasInterviewAccess,
    isSubscriptionExpired,
    subscriptionExpiresAt
}: SidebarProps) {
    const t = useTranslations("Sidebar")
    const locale = useLocale()

    const getTrackTitle = (track: Track) => {
        const titleEn = track.titleEn || (track as any).title_en
        const titleRu = track.titleRu || (track as any).title_ru
        if (locale === 'en' && titleEn) return titleEn
        if (locale === 'ru' && titleRu) return titleRu
        return track.title
    }

    const getLevelNum = (title: string, order: number | null) => {
        const match = title.match(/(?:[Рр][іи]вень|[Уу]ровень|Level)\s*(\d+)/i)
        return match ? parseInt(match[1]) : (order ?? 0)
    }

    const isProTrack = (title: string, order: number | null) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 1
        return getLevelNum(title, order) > maxOrder
    }

    const isDemo = !role
        || role.name?.toLowerCase().includes("демо")
        || role.name?.toLowerCase().includes("demo")
        || (role.maxTrackOrder !== null && role.maxTrackOrder <= 1)

    return (
        <aside className="w-full h-full bg-secondary/5 flex flex-col z-40">
            {/* Header / Logo + Plan Area */}
            <div className="px-6 pt-3 pb-4 border-b border-border/50 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-foreground font-bold text-xs leading-tight tracking-tight">Playwright Course</p>
                        <p className="text-muted-foreground text-[10px] font-medium">IT Automation Platform</p>
                    </div>
                </div>

                {/* User Plan Badge / Upgrade Card */}
                {isSubscriptionExpired ? (
                    <Link
                        href="/pricing"
                        className="group relative block p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-lg shadow-amber-500/5 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-wider">
                                ⚠️ {locale === 'en' ? "PRO ENDED" : locale === 'ru' ? "PRO ЗАВЕРШЕНА" : "PRO ЗАКІНЧИЛАСЯ"}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                {locale === 'en' ? "Renew" : locale === 'ru' ? "Продлить" : "Поновити"} <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-foreground">
                            {locale === 'en' ? "Renew Pro Access" : locale === 'ru' ? "Продлить тариф Pro" : "Поновити доступ Pro"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {locale === 'en' ? "Progress saved • Unlock 10 levels" : locale === 'ru' ? "Прогресс сохранен • Разблокировать" : "Прогрес збережено • Розблокувати"}
                        </p>
                    </Link>
                ) : !isDemo ? (
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex flex-col gap-1 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] opacity-80">{t("currentAccess")}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">{t("fullAccess")}</span>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-tight">{role?.name || "PRO"}</span>
                    </div>
                ) : (
                    <Link
                        href="/pricing"
                        className="group relative block p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/25 hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-amber-500/5 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[9px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                                ⚡ {t("demoMode")}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                {t("pricingLink")} <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                        <p className="text-xs font-bold text-foreground mb-0.5">{t("unlockAllLevels")}</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">{t("unlockAllLevelsDesc")}</p>
                    </Link>
                )}

                {/* Overall Progress */}
                {overallPct !== undefined && (
                    <div className="w-full flex flex-col gap-1.5 mt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("courseProgress")}</span>
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{overallPct}%</span>
                        </div>
                        <div className="w-full h-[3px] bg-secondary border border-border/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${overallPct}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Static top links + scrollable levels */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar min-h-0">
                {/* Step 0. Setup */}
                <Link
                    href="/setup"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/setup"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate tracking-wide">{t("setup")}</span>
                </Link>

                {/* Projects (Jira) */}
                <Link
                    href="/projects"
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/projects"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                    <div className="flex items-center gap-3 truncate">
                        <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate tracking-wide">{t("projects")}</span>
                    </div>
                    {hasPracticeAccess === false && !isAdmin && (
                        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                </Link>

                {/* Technical Interview */}
                <Link
                    href="/interview"
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/interview"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                    <div className="flex items-center gap-3 truncate">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate tracking-wide">{t("interview")}</span>
                    </div>
                    {hasInterviewAccess === false && !isAdmin && (
                        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                </Link>

                <div className="pt-2 pb-1 border-t border-border mx-2 my-1.5" />
                <p className="px-3 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">{t("courseLevels")}</p>

                {/* Levels list with elegant compact design */}
                {tracks.map(track => {
                    const { done, total } = getTrackProgress(track.id)
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const isSelected = track.id === selectedTrackId
                    const localizedTitle = getTrackTitle(track)
                    const isPro = isProTrack(localizedTitle, track.order)
                    const isDone = done === total && total > 0

                    const content = (
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs font-bold tracking-tight truncate flex-1 ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                    {localizedTitle}
                                </span>
                                {isPro && !isAdmin ? (
                                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                ) : (
                                    <span className={`text-[10px] font-bold flex-shrink-0 ${isDone ? "text-emerald-500" : isSelected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/70"}`}>
                                        {isDone ? `✓ ${done}/${total}` : `${done}/${total}`}
                                    </span>
                                )}
                            </div>
                            {/* Micro Progress Bar */}
                            <div className={`w-full h-[2.5px] rounded-full overflow-hidden ${isSelected ? "bg-primary/20" : "bg-secondary"}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${isDone ? "bg-emerald-500" : isSelected ? "bg-blue-600 dark:bg-blue-500" : "bg-muted-foreground/30"}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )

                    const baseClass = `flex flex-col px-3.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${isSelected
                        ? "sidebar-active-item text-blue-600 dark:text-blue-400 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-[3px] border-transparent"
                    } ${isPro && !isAdmin ? "opacity-60 grayscale" : ""}`

                    if (setSelectedTrackId) {
                        return (
                            <button
                                key={track.id}
                                onClick={() => setSelectedTrackId(track.id)}
                                className={baseClass}
                            >
                                {content}
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={track.id}
                            href={`/dashboard?trackId=${track.id}`}
                            className={baseClass}
                        >
                            {content}
                        </Link>
                    )
                })}
            </div>

            {/* Bottom: cabinet links */}
            <div className="px-3 pb-4 border-t border-border pt-3 space-y-1.5 flex-shrink-0">
                <Link
                    href="/cabinet?tab=certificates"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-amber-500/10 border border-blue-500/20 hover:border-amber-500/40 text-xs font-bold text-foreground transition-all group shadow-sm"
                >
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate tracking-wide">{t("tabCertificates")}</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-amber-400 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                    href="/cabinet"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/cabinet"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    <span className="tracking-wide">{t("cabinet")}</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-100 transition-all" />
                </Link>
            </div>
        </aside>
    )
}
