"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import {
    Plus, X, User, AlertCircle, Code2, Copy, Check,
    CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Terminal,
    Send, Clock, ExternalLink, GitPullRequest, MessageSquare, Globe
} from "lucide-react"
import { getTaskHelper } from "@/lib/projectTaskSnippets"
import { useTranslations, useLocale } from "next-intl"

interface User {
    id: string
    name: string | null
    email: string | null
    image: string | null
}

interface Task {
    id: number
    columnId: number
    title: string
    titleEn?: string | null
    titleRu?: string | null
    description: string | null
    descriptionEn?: string | null
    descriptionRu?: string | null
    priority: "low" | "medium" | "high" | "critical"
    assigneeId: string | null
}

interface ColumnData {
    id: number
    title: string
    order: number
    color: string | null
}

interface Props {
    boardId: number
    columnId: number
    columns?: ColumnData[]
    users: User[]
    task?: Task
    mode?: 'create' | 'edit' | 'view'
    onMoveToColumn?: (colId: number) => void
    onSuccess?: () => void
    onClose: () => void
}

export default function TaskDialog({
    boardId,
    columnId,
    columns = [],
    users,
    task,
    mode = 'create',
    onMoveToColumn,
    onSuccess,
    onClose
}: Props) {
    const t = useTranslations("Projects")
    const locale = useLocale()
    const [mounted, setMounted] = useState(false)
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">(task?.priority || "medium")
    const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId || "")
    const [currentColumnId, setCurrentColumnId] = useState<number>(task?.columnId || columnId)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const [activeTab, setActiveTab] = useState<'details' | 'code' | 'submit'>('details')
    const [langMode, setLangMode] = useState<'en' | 'native'>('en')

    const hasEnglish = Boolean(task?.titleEn || task?.descriptionEn)
    const nativeTitle = locale === 'ru' ? (task?.titleRu || task?.title || title) : (task?.title || title)
    const nativeDesc = locale === 'ru' ? (task?.descriptionRu || task?.description || description) : (task?.description || description)
    const currentTitle = (langMode === 'en' && task?.titleEn) ? task.titleEn : nativeTitle
    const currentDescription = (langMode === 'en' && task?.descriptionEn) ? task.descriptionEn : nativeDesc

    useEffect(() => {
        setMounted(true)
    }, [])

    // Submission Form State
    const [githubUrl, setGithubUrl] = useState("")
    const [solutionCode, setSolutionCode] = useState("")
    const [studentNotes, setStudentNotes] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [mySubmission, setMySubmission] = useState<any>(null)
    const [isLoadingSubmission, setIsLoadingSubmission] = useState(false)

    const taskHelper = getTaskHelper(title, description)

    // Criteria & tips in selected language (follows same langMode as title/description)
    const currentCriteria = (langMode === 'en' && taskHelper.acceptanceCriteriaEn?.length)
        ? taskHelper.acceptanceCriteriaEn
        : (locale === 'ru' && taskHelper.acceptanceCriteriaRu?.length)
            ? taskHelper.acceptanceCriteriaRu
            : taskHelper.acceptanceCriteria

    const currentTips = (langMode === 'en' && taskHelper.tipsEn?.length)
        ? taskHelper.tipsEn
        : (locale === 'ru' && taskHelper.tipsRu?.length)
            ? taskHelper.tipsRu
            : taskHelper.tips

    // Load existing submission for this task
    useEffect(() => {
        if (!task?.id || mode !== 'view') return

        const loadSubmission = async () => {
            setIsLoadingSubmission(true)
            try {
                const res = await fetch(`/api/projects/submissions?boardId=${boardId}`)
                if (res.ok) {
                    const data = await res.json()
                    const found = data.find((s: any) => s.taskId === task.id)
                    if (found) {
                        setMySubmission(found)
                        if (found.githubUrl) setGithubUrl(found.githubUrl)
                        if (found.code) setSolutionCode(found.code)
                        if (found.notes) setStudentNotes(found.notes)
                    }
                }
            } catch (err) {
                console.error("Failed to load submission:", err)
            } finally {
                setIsLoadingSubmission(false)
            }
        }

        loadSubmission()
    }, [task?.id, boardId, mode])

    const handleCopy = () => {
        if (!taskHelper.starterCode) return
        navigator.clipboard.writeText(taskHelper.starterCode)
        setCopiedCode(true)
        toast.success(t("copied"))
        setTimeout(() => setCopiedCode(false), 2000)
    }

    const handleMoveColumn = (newColId: number) => {
        setCurrentColumnId(newColId)
        onMoveToColumn?.(newColId)
    }

    const handleSubmitToMentor = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!githubUrl.trim() && !solutionCode.trim()) {
            toast.error(t("provideGithubOrCode"))
            return
        }

        setIsSubmittingReview(true)
        try {
            const res = await fetch("/api/projects/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId,
                    taskId: task?.id,
                    githubUrl,
                    code: solutionCode,
                    notes: studentNotes
                })
            })

            if (res.ok) {
                toast.success(t("submissionSuccessToast"))
                // Move task to Review column
                const reviewCol = columns.find(c => c.title.toLowerCase().includes("review"))
                if (reviewCol) {
                    handleMoveColumn(reviewCol.id)
                }
                setMySubmission({
                    status: "pending",
                    githubUrl,
                    code: solutionCode,
                    notes: studentNotes,
                    createdAt: new Date()
                })
                setActiveTab("submit")
            } else {
                const err = await res.json()
                toast.error(err.error || t("sendError"))
            }
        } catch {
            toast.error(t("connectionError"))
        } finally {
            setIsSubmittingReview(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error(t("taskTitleRequired"))
            return
        }

        setIsSubmitting(true)
        const isEditing = !!task
        const url = isEditing ? `/api/projects/tasks/${task.id}` : "/api/projects/tasks"
        const method = isEditing ? "PATCH" : "POST"

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId,
                    columnId: currentColumnId,
                    title,
                    description,
                    priority,
                    assigneeId: assigneeId || null,
                }),
            })

            if (res.ok) {
                toast.success(isEditing ? t("taskUpdated") : t("taskCreated"))
                onSuccess?.()
                onClose()
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error(t("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0B1120] border border-white/15 w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white my-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                                {mode === 'view' ? t("viewTask") : task ? t("editTask") : t("createTask")}
                            </h2>
                            {task && (
                                <p className="text-[10px] text-slate-400 font-mono">ID: #{task.id}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
                    {mode === 'view' ? (
                        <>
                            {/* Title & Category Badge */}
                            <div>
                                {hasEnglish && (
                                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                                            <span>{t("ticketLanguage")}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => setLangMode('en')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                                                    langMode === 'en'
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                                                        : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                <span>🇬🇧</span>
                                                <span>{t("jiraOriginal")}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLangMode('native')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                                                    langMode === 'native'
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                                                        : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                <span>{locale === 'ru' ? '🇷🇺' : '🇺🇦'}</span>
                                                <span>{t("nativeTranslation")}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold mb-2">
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>{taskHelper.category}</span>
                                    {hasEnglish && (
                                        <span className="ml-1 text-[10px] text-slate-400 border-l border-white/10 pl-2">
                                            {langMode === 'en' ? t("jiraOriginal") : t("nativeTranslation")}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-lg sm:text-xl font-black text-white leading-snug">
                                    {currentTitle}
                                </h1>
                            </div>

                            {/* Column Status Switcher Bar */}
                            {columns.length > 0 && (
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {t("moveToColumn")}:
                                        </p>
                                        {mySubmission && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                                mySubmission.status === 'reviewed'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : mySubmission.status === 'rejected'
                                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                                {mySubmission.status === 'reviewed' ? t("statusApproved") : mySubmission.status === 'rejected' ? t("statusRejected") : t("statusPending")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {columns.map(col => {
                                            const isCurrent = col.id === currentColumnId
                                            return (
                                                <button
                                                    key={col.id}
                                                    type="button"
                                                    onClick={() => handleMoveColumn(col.id)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                                                        isCurrent
                                                            ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20"
                                                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {col.title}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* View Tabs */}
                            <div className="flex border-b border-white/10 gap-4">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                                        activeTab === 'details'
                                            ? "border-blue-500 text-blue-400"
                                            : "border-transparent text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {t("taskDesc")}
                                </button>
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                                        activeTab === 'code'
                                            ? "border-blue-500 text-blue-400"
                                            : "border-transparent text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>{t("starterCode")}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('submit')}
                                    className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                                        activeTab === 'submit'
                                            ? "border-purple-500 text-purple-400"
                                            : "border-transparent text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{t("tabSubmit")}</span>
                                    {mySubmission && (
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    )}
                                </button>
                            </div>

                            {/* TAB 1: DETAILS */}
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                                            {currentDescription || <span className="text-slate-500 italic">{t("noDesc")}</span>}
                                        </p>
                                    </div>

                                    {/* Acceptance Criteria */}
                                    {currentCriteria?.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{t("acceptanceCriteria")}</span>
                                            </h3>
                                            <ul className="space-y-1.5">
                                                {currentCriteria.map((crit, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                        <span className="text-emerald-400 font-bold">•</span>
                                                        <span>{crit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {currentTips?.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>{t("mentorTips")}</span>
                                            </h3>
                                            <ul className="space-y-1.5">
                                                {currentTips.map((tip, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                        <span className="text-indigo-400 font-bold">•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: STARTER CODE */}
                            {activeTab === 'code' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                                            Language: {taskHelper.language}
                                        </span>
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold transition-all border border-blue-500/30"
                                        >
                                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedCode ? t("copied") : t("copyCode")}</span>
                                        </button>
                                    </div>

                                    <div className="relative rounded-2xl bg-[#030712] border border-white/10 p-4 overflow-x-auto">
                                        <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                                            <code>{taskHelper.starterCode}</code>
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: SUBMIT TO MENTOR */}
                            {activeTab === 'submit' && (
                                <div className="space-y-4">
                                    {/* Existing Status Banner if present */}
                                    {mySubmission && (
                                        <div className={`p-4 rounded-2xl border ${
                                            mySubmission.status === 'reviewed'
                                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                                                : mySubmission.status === 'rejected'
                                                ? 'bg-red-500/10 border-red-500/25 text-red-200'
                                                : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                                        }`}>
                                            <div className="flex items-center gap-2 font-bold text-sm mb-1">
                                                {mySubmission.status === 'reviewed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                {mySubmission.status === 'rejected' && <AlertCircle className="w-4 h-4 text-red-400" />}
                                                {mySubmission.status === 'pending' && <Clock className="w-4 h-4 text-amber-400" />}
                                                <span>
                                                    {mySubmission.status === 'reviewed' && t("submissionReviewed")}
                                                    {mySubmission.status === 'rejected' && t("submissionRejected")}
                                                    {mySubmission.status === 'pending' && t("submissionPending")}
                                                </span>
                                            </div>
                                            <p className="text-xs opacity-80 leading-relaxed">
                                                {mySubmission.status === 'pending' && t("submissionPendingDesc")}
                                                {mySubmission.status === 'rejected' && t("resubmitNotice")}
                                            </p>

                                            {mySubmission.mentorFeedback && (
                                                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10">
                                                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                                                        {t("mentorFeedbackTitle")}
                                                    </p>
                                                    <p className="text-xs text-white whitespace-pre-wrap font-sans">
                                                        {mySubmission.mentorFeedback}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Submission Form */}
                                    <form onSubmit={handleSubmitToMentor} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <GitPullRequest className="w-3.5 h-3.5 text-blue-400" />
                                                <span>{t("githubUrlLabel")}</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={githubUrl}
                                                onChange={(e) => setGithubUrl(e.target.value)}
                                                placeholder={t("githubUrlPlaceholder")}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs outline-none"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                                                <span>{t("solutionCodeLabel")}</span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={solutionCode}
                                                onChange={(e) => setSolutionCode(e.target.value)}
                                                placeholder={t("solutionCodePlaceholder")}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs font-mono outline-none resize-none"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                                <span>{t("notesLabel")}</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={studentNotes}
                                                onChange={(e) => setStudentNotes(e.target.value)}
                                                placeholder={t("notesPlaceholder")}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs outline-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{isSubmittingReview ? t("sending") : t("submitToMentorBtn")}</span>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Mentorship Rule Banner */}
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-200 leading-relaxed">
                                    {t("mentorNotice")}
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Edit or Create Form */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    {t("taskTitle")}
                                </label>
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t("taskTitlePlaceholder")}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all font-semibold text-white text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    {t("taskDesc")}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t("taskDescPlaceholder")}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all resize-none text-xs sm:text-sm font-medium text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        {t("taskPriority")}
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as any)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs outline-none cursor-pointer"
                                    >
                                        <option value="low" className="bg-slate-900">{t("priorityLow")}</option>
                                        <option value="medium" className="bg-slate-900">{t("priorityMedium")}</option>
                                        <option value="high" className="bg-slate-900">{t("priorityHigh")}</option>
                                        <option value="critical" className="bg-slate-900">{t("priorityCritical")}</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        {t("taskAssignee")}
                                    </label>
                                    <select
                                        value={assigneeId}
                                        onChange={(e) => setAssigneeId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs outline-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">{t("taskUnassigned")}</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id} className="bg-slate-900">
                                                {u.name || u.email || u.id}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? t("saving") : task ? t("saveTask") : t("createTask")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer in View Mode */}
                {mode === 'view' && (
                    <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
                        >
                            {t("close")}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
