"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlertCircle, Clock, User as UserIcon, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

interface Task {
    id: number
    columnId: number
    title: string
    description: string | null
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
}

const PRIORITY_COLORS = {
    low: "text-emerald-500 bg-emerald-50 border-emerald-100",
    medium: "text-amber-500 bg-amber-50 border-amber-100",
    high: "text-orange-500 bg-orange-50 border-orange-100",
    critical: "text-red-500 bg-red-50 border-red-100",
}

export default function TaskCard({ task, isOverlay, isAdmin, onEdit, onDelete }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
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

    if (isOverlay) {
        return (
            <div className="w-80 p-4 bg-white rounded-xl border-2 border-blue-500 shadow-2xl rotate-2">
                <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                    </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight mb-3">
                    {task.title}
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                        <Clock className="w-3 h-3" />
                        щойно
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative flex flex-col p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                </span>

                {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit?.(task)
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all font-bold"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm("Видалити цю задачу?")) {
                                    onDelete?.(task.id)
                                }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors mb-2">
                {task.title}
            </h3>

            {task.description && (
                <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                    <Clock className="w-3 h-3" />
                    2 дні тому
                </div>

                <div className="flex -space-x-2">
                    {task.assignee ? (
                        <img
                            src={task.assignee.image || `https://ui-avatars.com/api/?name=${task.assignee.name || 'U'}`}
                            alt={task.assignee.name || 'User'}
                            className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-slate-100 object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
