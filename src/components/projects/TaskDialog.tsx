"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    Plus, X, User, AlertCircle, Code2, Copy, Check,
    CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Terminal
} from "lucide-react"
import { getTaskHelper } from "@/lib/projectTaskSnippets"
import { useTranslations } from "next-intl"

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
    description: string | null
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
    task?: Task // Optional task for editing
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
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">(task?.priority || "medium")
    const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId || "")
    const [currentColumnId, setCurrentColumnId] = useState<number>(task?.columnId || columnId)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const [activeTab, setActiveTab] = useState<'details' | 'code'>('details')

    const taskHelper = getTaskHelper(title, description)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("Назва обов'язкова")
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
                toast.success(isEditing ? "Задачу оновлено" : "Задачу створено")
                onSuccess?.()
                onClose()
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error(isEditing ? "Помилка при оновленні" : "Помилка при створенні")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0B1120] border border-white/15 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
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
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold mb-2">
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>{taskHelper.category}</span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-black text-white leading-snug">
                                    {title}
                                </h1>
                            </div>

                            {/* Column Status Switcher Bar */}
                            {columns.length > 0 && (
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        {t("moveToColumn")}:
                                    </p>
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
                            </div>

                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                                            {description || <span className="text-slate-500 italic">Опис відсутній</span>}
                                        </p>
                                    </div>

                                    {/* Acceptance Criteria */}
                                    {taskHelper.acceptanceCriteria?.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Критерії прийомки (Acceptance Criteria)</span>
                                            </h3>
                                            <ul className="space-y-1.5">
                                                {taskHelper.acceptanceCriteria.map((crit, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                        <span className="text-emerald-400 font-bold">•</span>
                                                        <span>{crit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {taskHelper.tips?.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Поради ментора</span>
                                            </h3>
                                            <ul className="space-y-1.5">
                                                {taskHelper.tips.map((tip, idx) => (
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
                                    placeholder="Наприклад: [TypeScript] E2E: Авторизація"
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
                                    placeholder="Вимоги та деталі..."
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
                                    {isSubmitting ? "Збереження..." : task ? t("saveTask") : t("createTask")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer in View Mode */}
                {mode === 'view' && (
                    <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
                        >
                            {t("close")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
