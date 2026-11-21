"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import {
    LayoutGrid, ChevronLeft, Plus, Settings, ExternalLink,
    BookOpen, Search, Filter, X, CheckCircle2, ShieldAlert, Sparkles, Terminal,
    Send, ArrowRight, GitBranch, GitPullRequest, Copy, Check
} from "lucide-react"
import KanbanBoard from "@/components/projects/KanbanBoard"
import TaskDialog from "@/components/projects/TaskDialog"
import EditProjectDialog from "@/components/projects/EditProjectDialog"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"

interface Props {
    board: any
    initialTasks: any[]
    isAdmin: boolean
    users: any[]
    roles: any[]
    userLanguage?: string
}

export default function ProjectBoardContent({ board, initialTasks, isAdmin, users, roles, userLanguage }: Props) {
    const t = useTranslations("Projects")
    const locale = useLocale()
    const localizedBoardTitle = locale === 'en' ? (board.titleEn || board.title_en || board.title) : (locale === 'ru' ? (board.titleRu || board.title_ru || board.title) : board.title)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)
    const [showGuideDialog, setShowGuideDialog] = useState(false)
    const [guideTab, setGuideTab] = useState<'workflow' | 'git'>('workflow')
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedSnippet(id)
        setTimeout(() => setCopiedSnippet(null), 2000)
    }

    // Default to student's chosen language (TypeScript / Playwright by default)
    const defaultLanguage = userLanguage && ["typescript", "python", "csharp", "cicd"].includes(userLanguage)
        ? userLanguage
        : "typescript"
    const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage)
    const [selectedPriority, setSelectedPriority] = useState<string>("all")
    const router = useRouter()

    const getTargetUrl = () => {
        const title = (board?.title || "").toLowerCase()
        const desc = (board?.description || "").toLowerCase()
        if (board?.id === 4 || title.includes("premier") || desc.includes("premieronline.com")) {
            return "https://www.premieronline.com"
        }
        if (board?.id === 1 || title.includes("finmore")) {
            return "https://finmore.netlify.app"
        }
        return "https://itplatform-three.vercel.app"
    }
    const targetUrl = getTargetUrl()

    return (
        <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Top Navigation Bar */}
            <header className="relative z-40 flex-shrink-0 h-14 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10 flex items-center px-4 sm:px-6 justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Link
                        href="/projects"
                        className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title={t("backToProjects")}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("title")}</span>
                    </Link>

                    <div className="h-4 w-px bg-white/10" />

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                            <LayoutGrid className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="truncate">
                            <h1 className="text-white text-xs sm:text-sm font-bold tracking-tight truncate">{localizedBoardTitle}</h1>
                            <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider hidden sm:block">
                                {t("projectBoard")} • {initialTasks.length} {t("tasksPlural")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Target Application Link */}
                    <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-all shadow-sm"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t("openTarget")}</span>
                    </a>

                    {/* Instructions Guide Button */}
                    <button
                        onClick={() => {
                            setGuideTab('workflow')
                            setShowGuideDialog(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 transition-all shadow-sm"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t("instructions")}</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 hidden sm:block" />

                    {/* Language Switcher */}
                    <div className="flex items-center">
                        <LanguageSwitcher />
                    </div>

                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setShowAddDialog(true)}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 active:scale-95"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t("addTask")}</span>
                            </button>
                            <button
                                onClick={() => setShowSettingsDialog(true)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
                                title={t("accessSettings")}
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Context Explainer Banner (Admin vs Student) */}
            {isAdmin ? (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="font-bold">{t("adminMasterNotice")}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href="/admin/submissions"
                            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-[11px] transition-all flex items-center gap-1.5 border border-amber-500/30 shadow-sm"
                        >
                            <Send className="w-3 h-3" />
                            <span>{t("reviewQueue")}</span>
                        </Link>
                        <button
                            onClick={() => setShowSettingsDialog(true)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 border border-white/10"
                        >
                            <Settings className="w-3 h-3" />
                            <span>{t("accessSettings")}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 sm:px-6 py-2 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                            <span className="font-bold text-white mr-2">{t("projectSimulator")}:</span>
                            <span className="text-slate-300 text-[11px] hidden md:inline">{t("projectSimulatorDesc", { url: targetUrl })}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href="/cabinet?tab=submissions"
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-[11px] transition-all border border-white/10"
                        >
                            {t("cabinet")}
                        </Link>
                        <button
                            onClick={() => {
                                setGuideTab('git')
                                setShowGuideDialog(true)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t("gitInstructions")}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex-shrink-0 bg-[#0B1120]/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 text-xs text-white placeholder-slate-400 outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Active Stack Indicator - Only student's language is shown, all others hidden */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden lg:inline">
                        {t("filterLang")}:
                    </span>
                    <div className="px-3 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-600/25 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
                        <span>{userLanguage === "python" ? "Python" : userLanguage === "csharp" ? "C# .NET" : "TypeScript (Playwright)"}</span>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                    {/* Priority Selector */}
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white text-[11px] font-bold outline-none cursor-pointer"
                    >
                        <option value="all" className="bg-slate-900 text-white">{t("filterPriority")}: {t("filterAll")}</option>
                        <option value="critical" className="bg-slate-900 text-white">{t("priorityCritical")}</option>
                        <option value="high" className="bg-slate-900 text-white">{t("priorityHigh")}</option>
                        <option value="medium" className="bg-slate-900 text-white">{t("priorityMedium")}</option>
                        <option value="low" className="bg-slate-900 text-white">{t("priorityLow")}</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board Area */}
            <main className="flex-1 overflow-hidden relative">
                <KanbanBoard
                    initialTasks={initialTasks}
                    columns={board.columns.map((c: any) => ({ ...c, order: c.order ?? 0 }))}
                    isAdmin={isAdmin}
                    boardId={board.id}
                    users={users}
                    searchQuery={searchQuery}
                    selectedLanguage={selectedLanguage}
                    selectedPriority={selectedPriority}
                />
            </main>

            {/* Project Instructions / Git Guide Modal */}
            {showGuideDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0B1120] border border-white/15 w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white my-auto">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                    {guideTab === 'git' ? <GitBranch className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-white">
                                        {guideTab === 'git' ? t("tabGit") : t("instructionsTitle")}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {guideTab === 'git' ? t("gitGuideSubtitle") : t("instructionsDesc")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuideDialog(false)}
                                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs Switcher */}
                        <div className="flex border-b border-white/10 px-6 pt-3 gap-6 bg-white/[0.01] flex-shrink-0">
                            <button
                                onClick={() => setGuideTab('workflow')}
                                className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                    guideTab === 'workflow'
                                        ? "border-blue-500 text-blue-400"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{t("tabWorkflow")}</span>
                            </button>
                            <button
                                onClick={() => setGuideTab('git')}
                                className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                    guideTab === 'git'
                                        ? "border-indigo-500 text-indigo-400"
                                        : "border-transparent text-slate-400 hover:text-white"
                                }`}
                            >
                                <GitBranch className="w-3.5 h-3.5" />
                                <span>{t("tabGit")}</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                            {guideTab === 'workflow' ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <h3 className="font-bold text-white text-sm mb-1">{t("step1Title")}</h3>
                                        <p className="text-slate-400 leading-relaxed text-xs">{t("step1Desc")}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <h3 className="font-bold text-white text-sm mb-1">{t("step2Title")}</h3>
                                        <p className="text-slate-400 leading-relaxed text-xs">{t("step2Desc")}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <h3 className="font-bold text-white text-sm mb-1">{t("step3Title")}</h3>
                                        <p className="text-slate-400 leading-relaxed text-xs">{t("step3Desc")}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <h3 className="font-bold text-white text-sm mb-1">{t("step4Title")}</h3>
                                        <p className="text-slate-400 leading-relaxed text-xs">{t("step4Desc")}</p>
                                    </div>

                                    {/* Mentorship Requirement Note */}
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-200 leading-relaxed">
                                            {t("mentorNotice")}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* GIT & GITHUB GUIDE TAB */
                                <div className="space-y-4 text-xs">
                                    {/* Step 1: Init & Remote */}
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                            <Terminal className="w-4 h-4" />
                                            <span>{t("gitStep1Title")}</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">{t("gitStep1Desc")}</p>
                                        <div className="relative p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p><span className="text-slate-500"># {t("gitStep1Comment1")}</span></p>
                                                <p>git init</p>
                                                <p><span className="text-slate-500"># {t("gitStep1Comment2")}</span></p>
                                                <p>git remote add origin https://github.com/USERNAME/playwright-premier-tests.git</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard("git init\ngit remote add origin https://github.com/USERNAME/playwright-premier-tests.git", "step1")}
                                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-2 flex-shrink-0"
                                                title={t("copyCommand")}
                                            >
                                                {copiedSnippet === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 2: Branching */}
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                            <GitBranch className="w-4 h-4" />
                                            <span>{t("gitStep2Title")}</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">{t("gitStep2Desc")}</p>
                                        <div className="relative p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p><span className="text-slate-500"># {t("gitStep2Comment")}</span></p>
                                                <p>git checkout -b feature/TASK-1-base-pom</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard("git checkout -b feature/TASK-1-base-pom", "step2")}
                                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-2 flex-shrink-0"
                                                title={t("copyCommand")}
                                            >
                                                {copiedSnippet === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 3: Stage & Commit */}
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{t("gitStep3Title")}</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">{t("gitStep3Desc")}</p>
                                        <div className="relative p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p><span className="text-slate-500"># {t("gitStep3Comment1")}</span></p>
                                                <p>git status</p>
                                                <p><span className="text-slate-500"># {t("gitStep3Comment2")}</span></p>
                                                <p>git add src/ tests/ playwright.config.ts</p>
                                                <p><span className="text-slate-500"># {t("gitStep3Comment3")}</span></p>
                                                <p>git commit -m &quot;feat(pom): implement BasePage and EventCalendarPage with custom fixtures&quot;</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard("git add src/ tests/ playwright.config.ts\ngit commit -m \"feat(pom): implement BasePage and EventCalendarPage with custom fixtures\"", "step3")}
                                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-2 flex-shrink-0"
                                                title={t("copyCommand")}
                                            >
                                                {copiedSnippet === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 4: Push & PR */}
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                            <GitPullRequest className="w-4 h-4" />
                                            <span>{t("gitStep4Title")}</span>
                                        </div>
                                        <p className="text-slate-300 text-xs leading-relaxed">{t("gitStep4Desc")}</p>
                                        <div className="relative p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p><span className="text-slate-500"># {t("gitStep4Comment1")}</span></p>
                                                <p>git push -u origin feature/TASK-1-base-pom</p>
                                                <p><span className="text-slate-500"># {t("gitStep4Comment2")}</span></p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard("git push -u origin feature/TASK-1-base-pom", "step4")}
                                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-2 flex-shrink-0"
                                                title={t("copyCommand")}
                                            >
                                                {copiedSnippet === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 5: .gitignore recommendation */}
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                                            <span>{t("gitTipsTitle")}</span>
                                        </div>
                                        <p className="text-slate-300 text-[11px]">{t("gitTipsDesc")}</p>
                                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-amber-200">
                                            <code>
                                                node_modules/<br/>
                                                test-results/<br/>
                                                playwright-report/<br/>
                                                playwright/.auth/<br/>
                                                .env.local
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setShowGuideDialog(false)}
                                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25"
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddDialog && (
                <TaskDialog
                    boardId={board.id}
                    columnId={board.columns[0]?.id}
                    columns={board.columns}
                    users={users}
                    onClose={() => setShowAddDialog(false)}
                    onSuccess={() => {
                        setShowAddDialog(false)
                        router.refresh()
                    }}
                />
            )}

            {showSettingsDialog && (
                <EditProjectDialog
                    board={board}
                    allRoles={roles}
                    allUsers={users}
                    onClose={() => setShowSettingsDialog(false)}
                    onSuccess={() => {
                        setShowSettingsDialog(false)
                        router.refresh()
                    }}
                />
            )}
        </div>
    )
}
