"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import {
    LayoutGrid, Plus, ArrowRight, FolderOpen, Calendar, Lock, X, Sparkles
} from "lucide-react"
import CreateProjectDialog from "./CreateProjectDialog"
import Sidebar from "@/components/layout/Sidebar"

interface Board {
    id: number
    title: string
    titleEn?: string | null
    titleRu?: string | null
    description: string | null
    descriptionEn?: string | null
    descriptionRu?: string | null
    createdAt: string | Date
}

interface Track {
    id: number
    title: string
    titleEn?: string | null
    titleRu?: string | null
    order: number | null
}

interface Props {
    initialBoards: Board[]
    isAdmin: boolean
    tracks: Track[]
    tasks: any[]
    statusMap: Record<number, any>
    userName?: string | null
    userImage?: string | null
    role?: {
        id: number
        name: string
        maxTrackOrder: number | null
        hasPracticeAccess: boolean | null
    } | null
    allRoles: { id: number, name: string }[]
    allUsers: { id: string, name: string | null, email: string | null }[]
    hasPracticeAccess?: boolean
    hasInterviewAccess?: boolean
}

export default function ProjectsClient({
    initialBoards,
    isAdmin,
    tracks,
    tasks,
    statusMap,
    role,
    allRoles,
    allUsers,
    hasPracticeAccess = true,
    hasInterviewAccess = true
}: Props) {
    const t = useTranslations("Projects")
    const locale = useLocale()
    const [boards, setBoards] = useState<Board[]>(initialBoards)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const getBoardTitle = (board: Board) => {
        const titleEn = board.titleEn || (board as any).title_en
        const titleRu = board.titleRu || (board as any).title_ru
        if (locale === 'en' && titleEn) return titleEn
        if (locale === 'ru' && titleRu) return titleRu
        return board.title
    }

    const getBoardDesc = (board: Board) => {
        const descEn = board.descriptionEn || (board as any).description_en
        const descRu = board.descriptionRu || (board as any).description_ru
        if (locale === 'en' && descEn) return descEn
        if (locale === 'ru' && descRu) return descRu
        return board.description
    }

    const getTrackProgress = (trackId: number) => {
        const tTasks = tasks.filter(t => t.trackId === trackId)
        const done = tTasks.filter(t => statusMap[t.id] === "completed").length
        return { done, total: tTasks.length }
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] overflow-x-hidden font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Below header: Sidebar + Main Content (Floating Layout) */}
            <div className="flex px-4 pt-3 lg:pt-4 pb-4 gap-4 relative z-10 w-full max-w-[1600px] mx-auto">
                <div className="flex-shrink-0 w-80 rounded-[2rem] overflow-hidden glass-card-premium border border-white/5 shadow-2xl sticky top-[4.75rem] self-start h-[calc(100vh-5.5rem)]">
                    <Sidebar
                        tracks={tracks}
                        getTrackProgress={getTrackProgress}
                        isAdmin={isAdmin}
                        role={role}
                        currentPath="/projects"
                        overallPct={overallPct}
                        hasPracticeAccess={hasPracticeAccess}
                        hasInterviewAccess={hasInterviewAccess}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 glass-card-premium rounded-[2rem] border border-white/5 shadow-2xl relative p-8 min-w-0">
                    <div className="w-full relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-3xl glass-panel border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-500/10">
                                    <FolderOpen className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-white tracking-tight">{t("title")}</h1>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t("managementSystem")}</p>
                                    </div>
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="badge-gradient-blue px-8 py-3.5 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>{t("newProject")}</span>
                                </button>
                            )}
                        </div>

                        {/* Paywall Banner if restricted */}
                        {!hasPracticeAccess && !isAdmin && (
                            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">
                                            {locale === 'en' ? "Jira Projects require a Student or PRO plan" : (locale === 'ru' ? "Jira-проекты доступны в тарифах Студент и PRO" : "Jira-проєкти доступні у тарифах Студент та PRO")}
                                        </h4>
                                        <p className="text-xs text-slate-300">
                                            {locale === 'en' ? "Access real agile team sprints, bug reporting, and practice test automation suites." : (locale === 'ru' ? "Получите доступ к реальным командным спринтам, бэклогу и практике автоматизации." : "Отримайте доступ до реальних командних спринтів, беклогу та практики автоматизації.")}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/pricing"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs shadow-md shadow-amber-500/20 whitespace-nowrap text-center transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>{locale === 'en' ? "Upgrade Plan" : (locale === 'ru' ? "Перейти к тарифам" : "Перейти до тарифів")}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}

                        {boards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-[2rem] border-dashed">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                                    <LayoutGrid className="w-10 h-10 text-slate-700" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">{t("emptyTitle")}</h2>
                                <p className="text-slate-500 text-sm max-w-[280px] text-center">{t("emptyDesc")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {boards.map((board, idx) => (
                                    <Link
                                        key={board.id}
                                        href={`/projects/${board.id}`}
                                        onClick={(e) => {
                                            if (!hasPracticeAccess && !isAdmin) {
                                                e.preventDefault()
                                                setShowUpgradeModal(true)
                                            }
                                        }}
                                        className={`group relative block p-8 glass-card-premium-v2 glass-card-premium-hover rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] accent-glow-top border-t-blue-500/30 ${!hasPracticeAccess && !isAdmin ? "opacity-80" : ""}`}
                                    >
                                        {/* Mesh Gradient Glow */}
                                        <div className={`absolute -bottom-24 -left-24 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full ${idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'}`} />

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-500">
                                                    <LayoutGrid className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    {!hasPracticeAccess && !isAdmin ? (
                                                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                                                            <Lock className="w-3 h-3 text-amber-400" />
                                                            PRO / Team
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                            {new Date(board.createdAt).toLocaleDateString()}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-3">
                                                {getBoardTitle(board)}
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 min-h-[44px]">
                                                {getBoardDesc(board) || t("noDesc")}
                                            </p>
                                            <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity pt-6 border-t border-white/5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
                                                    {!hasPracticeAccess && !isAdmin ? "Unlock Project" : t("viewBoard")}
                                                </span>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-blue-500/30 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all">
                                                    {!hasPracticeAccess && !isAdmin ? (
                                                        <Lock className="w-4 h-4 text-amber-400" />
                                                    ) : (
                                                        <ArrowRight className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showCreateDialog && (
                <CreateProjectDialog
                    allRoles={allRoles}
                    allUsers={allUsers}
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={(id) => {
                        window.location.href = `/projects/${id}`
                    }}
                />
            )}

            {/* Paywall Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6">
                        <button
                            type="button"
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>

                        <div className="space-y-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                {locale === 'en' ? "Student & PRO Feature" : (locale === 'ru' ? "Тариф Студент / PRO" : "Тариф Студент / PRO")}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {locale === 'en' ? "Unlock Jira Practice Projects" : (locale === 'ru' ? "Разблокируйте Jira-проекты" : "Розблокуйте Jira-проєкти")}
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {locale === 'en'
                                    ? "Work with real Jira-style Kanban boards, sprint task queues, bug tickets, and end-to-end automation test projects. Available in Student Base, PRO, and B2B plans."
                                    : (locale === 'ru'
                                        ? "Работайте с реальными Kanban-досками в стиле Jira, спринтами, баг-трекингом и e2e автоматизацией. Доступно в тарифах Студент Base, PRO и B2B."
                                        : "Працюйте з реальними Kanban-дошками у стилі Jira, спринтами, баг-трекінгом та e2e автоматизацією. Доступно у тарифах Студент Base, PRO та B2B.")}
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/pricing"
                                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm shadow-xl shadow-amber-500/20 text-center transition-all flex items-center justify-center gap-2"
                            >
                                <span>{locale === 'en' ? "View Pricing Plans" : (locale === 'ru' ? "Посмотреть тарифы" : "Переглянути тарифи")}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/activate"
                                className="py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-sm text-center border border-white/10 transition-colors"
                            >
                                {locale === 'en' ? "Activate Code" : (locale === 'ru' ? "Активировать код" : "Активувати код")}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
