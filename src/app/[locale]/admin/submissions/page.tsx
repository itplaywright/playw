"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import CodeEditor from "@/components/editor/Monaco"
import {
    CheckCircle2, Clock, User, BookOpen, Send, ChevronRight,
    Search, X, Filter, RefreshCw, MessageSquare,
    Code2, Layers, Mic, ArrowUpDown, Eye, Star,
    AlertTriangle, ThumbsUp, ThumbsDown, Calendar,
    Copy, Check, ExternalLink, FileCode, Info
} from "lucide-react"
import { useLocale } from "next-intl"
import ReactMarkdown from "react-markdown"

interface Submission {
    id: number | string
    code: string
    status: "pending" | "reviewed" | "rejected"
    mentorFeedback: string | null
    createdAt: string | Date
    userName: string | null
    userEmail: string | null
    taskTitle: string
    taskId: number | string
    isProject?: boolean
    isInterview?: boolean
}

type TabFilter = "all" | "pending" | "reviewed" | "rejected"
type TypeFilter = "all" | "task" | "project" | "interview"
type SortOrder = "newest" | "oldest"

const t = {
    ru: {
        title: "Очередь Ревью",
        subtitle: "Проверяйте задания студентов и оставляйте фидбек",
        pending: "Ожидают проверки",
        reviewed: "Одобренные",
        rejected: "Запрошены правки",
        filterAll: "Все",
        filterPending: "На ревью",
        filterReviewed: "Принятые",
        filterRejected: "Правки",
        filterAllTypes: "Все типы",
        filterTask: "Задания",
        filterProject: "Проекты",
        filterInterview: "Собеседования",
        searchPlaceholder: "Поиск по студенту или заданию...",
        noSubmissions: "Работ не найдено",
        noSubmissionsDesc: "Попробуйте изменить фильтры или поиск",
        submittedOn: "Дата сдачи",
        reviewedOn: "Дата проверки",
        statusBadge: { pending: "НОВОЕ", reviewed: "ПРИНЯТО", rejected: "ПРАВКИ" },
        typeBadge: { task: "Задание", project: "Проект", interview: "Собеседование" },
        feedbackLabel: "Комментарий ментора (Markdown)",
        feedbackPlaceholder: "Напишите фидбек студенту... Поддерживается Markdown: **жирный**, `код`, ### заголовки",
        approve: "Принять работу ✓",
        requestChanges: "Запросить правки",
        saving: "Сохраняем...",
        existingFeedback: "Предыдущий фидбек",
        previewTab: "Предпросмотр",
        editTab: "Редактор",
        codeTab: "Код студента",
        refresh: "Обновить",
        copied: "Скопировано!",
        copyCode: "Копировать код",
        total: "всего",
        emptyTitle: "Выберите работу для ревью",
        emptyDesc: "Нажмите на любую работу в списке слева, чтобы начать проверку",
        feedbackRequired: "Введите фидбек перед сохранением",
    },
    uk: {
        title: "Черга Ревью",
        subtitle: "Перевіряйте роботи студентів та залишайте зворотній зв'язок",
        pending: "Очікують перевірки",
        reviewed: "Прийняті",
        rejected: "Запитано правки",
        filterAll: "Всі",
        filterPending: "На ревью",
        filterReviewed: "Прийняті",
        filterRejected: "Правки",
        filterAllTypes: "Всі типи",
        filterTask: "Завдання",
        filterProject: "Проекти",
        filterInterview: "Співбесіди",
        searchPlaceholder: "Пошук за студентом або завданням...",
        noSubmissions: "Робіт не знайдено",
        noSubmissionsDesc: "Спробуйте змінити фільтри або пошуковий запит",
        submittedOn: "Дата здачі",
        reviewedOn: "Дата перевірки",
        statusBadge: { pending: "НОВЕ", reviewed: "ПРИЙНЯТО", rejected: "ПРАВКИ" },
        typeBadge: { task: "Завдання", project: "Проект", interview: "Співбесіда" },
        feedbackLabel: "Коментар ментора (Markdown)",
        feedbackPlaceholder: "Напишіть фідбек студенту... Підтримується Markdown: **жирний**, `код`, ### заголовки",
        approve: "Прийняти роботу ✓",
        requestChanges: "Запросити правки",
        saving: "Зберігаємо...",
        existingFeedback: "Попередній фідбек",
        previewTab: "Превʼю",
        editTab: "Редактор",
        codeTab: "Код студента",
        refresh: "Оновити",
        copied: "Скопійовано!",
        copyCode: "Копіювати код",
        total: "всього",
        emptyTitle: "Оберіть роботу для ревью",
        emptyDesc: "Натисніть на будь-яку роботу у списку зліва, щоб розпочати перевірку",
        feedbackRequired: "Введіть фідбек перед збереженням",
    },
    en: {
        title: "Review Queue",
        subtitle: "Review student submissions and provide mentor feedback",
        pending: "Awaiting Review",
        reviewed: "Approved",
        rejected: "Changes Requested",
        filterAll: "All",
        filterPending: "Pending",
        filterReviewed: "Reviewed",
        filterRejected: "Rejected",
        filterAllTypes: "All types",
        filterTask: "Tasks",
        filterProject: "Projects",
        filterInterview: "Interviews",
        searchPlaceholder: "Search by student or task...",
        noSubmissions: "No submissions found",
        noSubmissionsDesc: "Try adjusting your filters or search query",
        submittedOn: "Submitted on",
        reviewedOn: "Reviewed on",
        statusBadge: { pending: "NEW", reviewed: "APPROVED", rejected: "CHANGES" },
        typeBadge: { task: "Task", project: "Project", interview: "Interview" },
        feedbackLabel: "Mentor Feedback (Markdown)",
        feedbackPlaceholder: "Write your feedback here... Markdown supported: **bold**, `code`, ### headings",
        approve: "Approve ✓",
        requestChanges: "Request Changes",
        saving: "Saving...",
        existingFeedback: "Previous Feedback",
        previewTab: "Preview",
        editTab: "Editor",
        codeTab: "Student Code",
        refresh: "Refresh",
        copied: "Copied!",
        copyCode: "Copy code",
        total: "total",
        emptyTitle: "Select a submission to review",
        emptyDesc: "Click on any submission from the list on the left to start reviewing",
        feedbackRequired: "Please add feedback before saving",
    }
}

export default function AdminSubmissionsPage() {
    const locale = useLocale() as "ru" | "uk" | "en"
    const tr = t[locale] || t.ru

    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [feedback, setFeedback] = useState("")
    const [feedbackTab, setFeedbackTab] = useState<"edit" | "preview">("edit")
    const [activeTab, setActiveTab] = useState<"code" | "feedback">("code")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<TabFilter>("all")
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async (silent = false) => {
        if (!silent) setIsLoading(true)
        else setIsRefreshing(true)
        try {
            const res = await fetch("/api/admin/submissions")
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to load")
            }
            const data = await res.json()
            setSubmissions(Array.isArray(data) ? data : [])
        } catch (error: any) {
            toast.error(error.message || "Failed to load submissions")
            setSubmissions([])
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleSelectSubmission = (s: Submission) => {
        setSelectedSubmission(s)
        setFeedback(s.mentorFeedback || "")
        setFeedbackTab("edit")
        setActiveTab("code")
    }

    const handleSubmitReview = async (status: "reviewed" | "rejected") => {
        if (!selectedSubmission || !feedback.trim()) {
            toast.error(tr.feedbackRequired)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/submissions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId: selectedSubmission.id,
                    feedback,
                    status,
                    isProject: selectedSubmission.isProject,
                    isInterview: selectedSubmission.isInterview
                })
            })

            if (res.ok) {
                toast.success(status === "reviewed" ? "✅ Роботу прийнято!" : "🔄 Запит на правки надіслано!")
                setSelectedSubmission(null)
                setFeedback("")
                fetchSubmissions(true)
            } else {
                toast.error("Помилка при збереженні")
            }
        } catch {
            toast.error("Сталася помилка")
        } finally {
            setIsSubmitting(false)
        }
    }

    const copyCode = () => {
        if (!selectedSubmission?.code) return
        navigator.clipboard.writeText(selectedSubmission.code)
        setCopied(true)
        toast.success(tr.copied)
        setTimeout(() => setCopied(false), 2000)
    }

    // KPI
    const kpi = useMemo(() => ({
        pending: submissions.filter(s => s.status === "pending").length,
        reviewed: submissions.filter(s => s.status === "reviewed").length,
        rejected: submissions.filter(s => s.status === "rejected").length,
        total: submissions.length,
    }), [submissions])

    // Filtered + sorted list
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => {
            const q = searchQuery.toLowerCase().trim()
            if (q) {
                const name = (s.userName || s.userEmail || "").toLowerCase()
                const email = (s.userEmail || "").toLowerCase()
                const title = (s.taskTitle || "").toLowerCase()
                if (!name.includes(q) && !email.includes(q) && !title.includes(q)) return false
            }
            if (statusFilter !== "all" && s.status !== statusFilter) return false
            if (typeFilter === "task" && (s.isProject || s.isInterview)) return false
            if (typeFilter === "project" && (!s.isProject || s.isInterview)) return false
            if (typeFilter === "interview" && !s.isInterview) return false
            return true
        }).sort((a, b) => {
            const tA = new Date(a.createdAt || 0).getTime()
            const tB = new Date(b.createdAt || 0).getTime()
            return sortOrder === "newest" ? tB - tA : tA - tB
        })
    }, [submissions, searchQuery, statusFilter, typeFilter, sortOrder])

    const getTypeInfo = (s: Submission) => {
        if (s.isInterview) return { label: tr.typeBadge.interview, icon: Mic, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
        if (s.isProject) return { label: tr.typeBadge.project, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Layers }
        return { label: tr.typeBadge.task, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Code2 }
    }

    const getStatusInfo = (status: Submission["status"]) => {
        switch (status) {
            case "pending": return { label: tr.statusBadge.pending, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: Clock }
            case "reviewed": return { label: tr.statusBadge.reviewed, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 }
            case "rejected": return { label: tr.statusBadge.rejected, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle }
        }
    }

    const displayName = (s: Submission | null) => s?.userName || s?.userEmail?.split("@")[0] || "Student"

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[700px] gap-0">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        {tr.title}
                        {kpi.pending > 0 && (
                            <span className="text-sm font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse">
                                {kpi.pending}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{tr.subtitle}</p>
                </div>
                <button
                    onClick={() => fetchSubmissions(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-secondary text-sm font-bold text-foreground transition-all shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 text-blue-500 ${isRefreshing ? "animate-spin" : ""}`} />
                    {tr.refresh}
                </button>
            </div>

            {/* ── KPI CHIPS ── */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                    { key: "all", count: kpi.total, label: tr.filterAll, color: "blue" },
                    { key: "pending", count: kpi.pending, label: tr.filterPending, color: "rose" },
                    { key: "reviewed", count: kpi.reviewed, label: tr.filterReviewed, color: "emerald" },
                    { key: "rejected", count: kpi.rejected, label: tr.filterRejected, color: "amber" },
                ].map(chip => (
                    <button
                        key={chip.key}
                        onClick={() => setStatusFilter(chip.key as TabFilter)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center group ${statusFilter === chip.key
                            ? `bg-${chip.color}-500/10 border-${chip.color}-500/30 shadow-sm`
                            : "bg-card border-border hover:border-border/80 hover:bg-secondary/40"
                        }`}
                    >
                        <span className={`text-2xl font-black leading-none mb-0.5 ${statusFilter === chip.key ? `text-${chip.color}-400` : "text-foreground"}`}>
                            {chip.count}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{chip.label}</span>
                    </button>
                ))}
            </div>

            {/* ── MAIN SPLIT PANEL ── */}
            <div className="flex flex-1 overflow-hidden rounded-2xl border border-border shadow-lg bg-card">

                {/* LEFT: SUBMISSIONS LIST */}
                <div className="w-80 lg:w-96 xl:w-[420px] shrink-0 border-r border-border flex flex-col bg-card/80">

                    {/* Search + Filters */}
                    <div className="p-3 border-b border-border space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={tr.searchPlaceholder}
                                className="w-full bg-secondary/40 border border-border rounded-xl py-2 pl-9 pr-8 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-foreground placeholder:text-muted-foreground/40"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Type + Sort filters */}
                        <div className="flex gap-2">
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value as TypeFilter)}
                                className="flex-1 bg-secondary/40 border border-border rounded-xl py-1.5 px-2.5 text-xs font-bold text-foreground focus:outline-none"
                            >
                                <option value="all">{tr.filterAllTypes}</option>
                                <option value="task">{tr.filterTask}</option>
                                <option value="project">{tr.filterProject}</option>
                                <option value="interview">{tr.filterInterview}</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(o => o === "newest" ? "oldest" : "newest")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/40 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-secondary"
                                title={sortOrder === "newest" ? "Спочатку нові" : "Спочатку старі"}
                            >
                                <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
                                {sortOrder === "newest" ? "↓ Нові" : "↑ Старі"}
                            </button>
                        </div>

                        {/* Count */}
                        <div className="text-[11px] text-muted-foreground font-medium px-0.5">
                            {filteredSubmissions.length} / {submissions.length} {tr.total}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-12">
                                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-xs text-muted-foreground font-medium">Завантаження...</span>
                            </div>
                        ) : filteredSubmissions.length === 0 ? (
                            <div className="p-10 text-center">
                                <FileCode className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">{tr.noSubmissions}</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">{tr.noSubmissionsDesc}</p>
                            </div>
                        ) : (
                            filteredSubmissions.map(s => {
                                const isSelected = selectedSubmission?.id === s.id
                                const type = getTypeInfo(s)
                                const stat = getStatusInfo(s.status)
                                const TypeIcon = type.icon
                                const StatIcon = stat.icon

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectSubmission(s)}
                                        className={`w-full text-left border-b border-border/60 transition-all group relative ${isSelected
                                            ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                                            : "hover:bg-secondary/30 border-l-2 border-l-transparent"
                                        }`}
                                    >
                                        <div className="p-4">
                                            {/* Row 1: avatar + name + status */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 uppercase ${isSelected ? "bg-blue-600 text-white" : "bg-secondary text-muted-foreground"}`}>
                                                        {displayName(s)[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className={`text-sm font-bold truncate ${isSelected ? "text-blue-400" : "text-foreground group-hover:text-blue-400 transition-colors"}`}>
                                                            {displayName(s)}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                                                            {s.userEmail || ""}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status badge */}
                                                <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${stat.color}`}>
                                                    <StatIcon className="w-2.5 h-2.5" />
                                                    {stat.label}
                                                </span>
                                            </div>

                                            {/* Row 2: task title */}
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 ml-11">
                                                <TypeIcon className="w-3 h-3 shrink-0 opacity-70" />
                                                <span className="truncate font-medium">{s.taskTitle}</span>
                                            </div>

                                            {/* Row 3: type badge + date */}
                                            <div className="flex items-center justify-between ml-11">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${type.color}`}>
                                                    <TypeIcon className="w-2.5 h-2.5" />
                                                    {type.label}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60 font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: REVIEW PANEL */}
                {selectedSubmission ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] text-slate-100">

                        {/* Review Header */}
                        <div className="px-6 py-4 border-b border-white/5 bg-slate-950/60 flex items-center justify-between gap-4 shrink-0">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm uppercase shrink-0">
                                        {displayName(selectedSubmission)[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-black text-white leading-tight truncate">
                                            {displayName(selectedSubmission)}
                                        </h2>
                                        <p className="text-xs text-slate-400 font-medium truncate">{selectedSubmission.userEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {/* Type + Status badges */}
                                {(() => {
                                    const type = getTypeInfo(selectedSubmission)
                                    const stat = getStatusInfo(selectedSubmission.status)
                                    const TypeIcon = type.icon
                                    const StatIcon = stat.icon
                                    return (
                                        <>
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${type.color}`}>
                                                <TypeIcon className="w-3 h-3" />
                                                {type.label}
                                            </span>
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${stat.color}`}>
                                                <StatIcon className="w-3 h-3" />
                                                {stat.label}
                                            </span>
                                        </>
                                    )
                                })()}
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{tr.submittedOn}</span>
                                    <span className="text-xs font-bold text-white">
                                        {new Date(selectedSubmission.createdAt).toLocaleDateString()} {new Date(selectedSubmission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Task title bar */}
                        <div className="px-6 py-2.5 border-b border-white/5 bg-slate-950/40 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-300 truncate">{selectedSubmission.taskTitle}</span>
                        </div>

                        {/* Main area: Tabs (Code / Feedback) */}
                        <div className="flex border-b border-white/5 bg-slate-950/60 shrink-0">
                            <button
                                onClick={() => setActiveTab("code")}
                                className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === "code" ? "text-blue-400 border-blue-500" : "text-slate-500 border-transparent hover:text-slate-300"}`}
                            >
                                <Code2 className="w-3.5 h-3.5" />
                                {tr.codeTab}
                            </button>
                            <button
                                onClick={() => setActiveTab("feedback")}
                                className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === "feedback" ? "text-blue-400 border-blue-500" : "text-slate-500 border-transparent hover:text-slate-300"}`}
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {tr.feedbackLabel}
                                {selectedSubmission.mentorFeedback && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                )}
                            </button>
                        </div>

                        {/* Code tab */}
                        {activeTab === "code" && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Code header bar */}
                                <div className="px-4 py-2 border-b border-white/5 bg-[#121212] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/40" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">
                                            {selectedSubmission.isInterview ? "interview-result.ts" : selectedSubmission.isProject ? "project-submission.ts" : "solution.spec.ts"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={copyCode}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? tr.copied : tr.copyCode}
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <CodeEditor
                                        value={selectedSubmission.code}
                                        onChange={() => { }}
                                        readOnly={true}
                                    />
                                </div>

                                {/* Quick action bar at bottom of code view */}
                                <div className="px-4 py-3 border-t border-white/5 bg-slate-950/60 flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            placeholder={`${tr.feedbackLabel}...`}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-blue-500/50 text-slate-200 placeholder:text-slate-600 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setActiveTab("feedback"); setFeedbackTab("edit") }}
                                        className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleSubmitReview("reviewed")}
                                        disabled={isSubmitting || !feedback.trim()}
                                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {isSubmitting ? tr.saving : tr.approve}
                                    </button>
                                    <button
                                        onClick={() => handleSubmitReview("rejected")}
                                        disabled={isSubmitting || !feedback.trim()}
                                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-amber-400 font-black text-xs uppercase tracking-wider transition-all"
                                    >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                        {tr.requestChanges}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Feedback tab */}
                        {activeTab === "feedback" && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Previous feedback if exists */}
                                {selectedSubmission.mentorFeedback && (
                                    <div className="mx-4 mt-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">{tr.existingFeedback}</span>
                                        </div>
                                        <div className="text-xs text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{selectedSubmission.mentorFeedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {/* Editor / Preview tabs */}
                                <div className="flex gap-1 px-4 pt-4">
                                    <button
                                        onClick={() => setFeedbackTab("edit")}
                                        className={`px-4 py-1.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all ${feedbackTab === "edit" ? "bg-slate-800 text-blue-400 border border-b-0 border-white/10" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        ✏️ {tr.editTab}
                                    </button>
                                    <button
                                        onClick={() => setFeedbackTab("preview")}
                                        className={`px-4 py-1.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all ${feedbackTab === "preview" ? "bg-slate-800 text-blue-400 border border-b-0 border-white/10" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        👁 {tr.previewTab}
                                    </button>
                                </div>

                                <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
                                    {feedbackTab === "edit" ? (
                                        <textarea
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            placeholder={tr.feedbackPlaceholder}
                                            className="flex-1 w-full bg-slate-900 border border-white/10 rounded-b-2xl rounded-tr-2xl p-5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed placeholder:text-slate-600 font-mono"
                                        />
                                    ) : (
                                        <div className="flex-1 overflow-y-auto bg-slate-900 border border-white/10 rounded-b-2xl rounded-tr-2xl p-5">
                                            {feedback.trim() ? (
                                                <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                                                    <ReactMarkdown>{feedback}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-600 italic">{tr.feedbackPlaceholder}</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="px-4 pb-4 space-y-2">
                                    <button
                                        onClick={() => handleSubmitReview("reviewed")}
                                        disabled={isSubmitting || !feedback.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        {isSubmitting ? tr.saving : tr.approve}
                                    </button>
                                    <button
                                        onClick={() => handleSubmitReview("rejected")}
                                        disabled={isSubmitting || !feedback.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-amber-400 font-bold text-sm uppercase tracking-wider transition-all"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                        {tr.requestChanges}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0d1117]">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-inner">
                            <Eye className="w-9 h-9 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight mb-2">{tr.emptyTitle}</h2>
                        <p className="max-w-xs text-sm text-slate-500 leading-relaxed">{tr.emptyDesc}</p>

                        {kpi.pending > 0 && (
                            <div className="mt-6 px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                <span className="text-sm font-black text-rose-400">
                                    🔥 {kpi.pending} {tr.filterPending.toLowerCase()}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
