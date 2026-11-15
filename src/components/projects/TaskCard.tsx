"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlertCircle, Clock, User as UserIcon, Trash2, Edit, Code2, Terminal } from "lucide-react"
import { useLocale } from "next-intl"

interface Task {
    id: number
    columnId: number
    title: string
    titleEn?: string | null
    description: string | null
    descriptionEn?: string | null
    priority: "low" | "medium" | "high" | "critical"
    assigneeId: string | null
    assignee?: { name: string | null, image: string | null }
}

interface Props {
    task: Task
    isOverlay?: boolean
    isAdmin?: boolean
    onEdit?: (task: Task) => void
    onDelete?: (id: number) => void
    onView?: (task: Task) => void
}

const PRIORITY_BADGES = {
    low: { label: "Low", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    medium: { label: "Medium", bg: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    high: { label: "High", bg: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
    critical: { label: "Critical", bg: "bg-red-500/15 text-red-400 border-red-500/30" },
}

function parseTags(title: string) {
    const tags: { label: string; color: string }[] = []
    const lower = title.toLowerCase()

    if (lower.includes("typescript")) tags.push({ label: "TS", color: "bg-blue-600/20 text-blue-300 border-blue-500/30" })
    if (lower.includes("python")) tags.push({ label: "Python", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" })
    if (lower.includes("c#") || lower.includes(".net")) tags.push({ label: "C#", color: "bg-purple-600/20 text-purple-300 border-purple-500/30" })
    if (lower.includes("ci/cd") || lower.includes("github actions")) tags.push({ label: "CI/CD", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" })
    if (lower.includes("pom") || lower.includes("page object")) tags.push({ label: "POM", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" })
    if (lower.includes("api")) tags.push({ label: "API", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" })
    if (lower.includes("e2e")) tags.push({ label: "E2E", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" })
    if (lower.includes("mobile") || lower.includes("cross-browser")) tags.push({ label: "Mobile", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" })
    if (lower.includes("visual")) tags.push({ label: "Visual", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" })
    if (lower.includes("network")) tags.push({ label: "Mock", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" })

    // Clean title from brackets if tags were found
    let cleanTitle = title.replace(/\[.*?\]\s*/g, "").trim()
    if (!cleanTitle) cleanTitle = title

    return { tags, cleanTitle }
}

export default function TaskCard({ task, isOverlay, isAdmin, onEdit, onDelete, onView }: Props) {
    const locale = useLocale()
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `task-${task.id}`,
        data: {
            type: "Task",
            task,
        },
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
    }

    const rawTitle = (locale === 'en' && task.titleEn) ? task.titleEn : task.title
    const rawDescription = (locale === 'en' && task.descriptionEn) ? task.descriptionEn : task.description
    const { tags, cleanTitle } = parseTags(rawTitle)
    const priority = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium

    if (isOverlay) {
        return (
            <div className="w-72 p-4 bg-[#0F172A] rounded-xl border-2 border-blue-500 shadow-2xl rotate-2 text-white">
                <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${priority.bg}`}>
                        {priority.label}
                    </span>
                    {tags.map((tag, idx) => (
                        <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tag.color}`}>
                            {tag.label}
                        </span>
                    ))}
                </div>
                <h3 className="font-bold text-white text-xs leading-snug mb-2">
                    {cleanTitle}
                </h3>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onView?.(task)}
            className="group relative flex flex-col p-3.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/10 hover:border-blue-500/40 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer text-white"
        >
            {/* Header: Priority + Tags */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${priority.bg}`}>
                        {priority.label}
                    </span>

                    {tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tag.color}`}>
                            {tag.label}
                        </span>
                    ))}
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit?.(task)
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Редагувати"
                        >
                            <Edit className="w-3 h-3" />
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete?.(task.id)
                            }}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Видалити"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-white text-xs leading-relaxed group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                {cleanTitle}
            </h3>

            {/* Description Snippet */}
            {rawDescription && (
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {rawDescription}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    <span>#{task.id}</span>
                </div>

                {task.assignee ? (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {task.assignee.image ? (
                            <img src={task.assignee.image} alt="" className="w-4 h-4 rounded-full" />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                                {task.assignee.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="truncate max-w-[80px]">{task.assignee.name}</span>
                    </div>
                ) : (
                    <span className="text-[9px] text-slate-500 font-medium">Без виконавця</span>
                )}
            </div>
        </div>
    )
}
