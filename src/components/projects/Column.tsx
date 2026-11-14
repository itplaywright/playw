"use client"

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import TaskCard from "./TaskCard"
import { Plus, Trash2 } from "lucide-react"

interface Task {
    id: number
    columnId: number
    title: string
    description: string | null
    priority: "low" | "medium" | "high" | "critical"
    assigneeId: string | null
    assignee?: { name: string | null, image: string | null }
}

interface ColumnData {
    id: number
    title: string
    order: number
    color: string | null
}

interface Props {
    column: ColumnData
    tasks: Task[]
    isAdmin: boolean
    onEditTask?: (task: Task) => void
    onDeleteTask?: (id: number) => void
    onAddTask?: (columnId: number) => void
    onRemoveColumn?: (id: number) => void
    onViewTask?: (task: Task) => void
}

const COLUMN_COLORS: Record<string, { dot: string; glow: string; border: string }> = {
    "To Do": { dot: "bg-slate-400", glow: "shadow-slate-500/20", border: "border-slate-500/20" },
    "In Progress": { dot: "bg-blue-500", glow: "shadow-blue-500/30", border: "border-blue-500/30" },
    "Review": { dot: "bg-purple-500", glow: "shadow-purple-500/30", border: "border-purple-500/30" },
    "Done": { dot: "bg-emerald-500", glow: "shadow-emerald-500/30", border: "border-emerald-500/30" },
}

export default function Column({ column, tasks, isAdmin, onEditTask, onDeleteTask, onAddTask, onRemoveColumn, onViewTask }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `column-${column.id}`,
        data: {
            type: "Column",
            column,
        },
        disabled: !isAdmin,
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
    }

    const colStyle = COLUMN_COLORS[column.title] || {
        dot: "bg-blue-400",
        glow: "shadow-blue-500/20",
        border: "border-white/10"
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex h-[calc(100vh-12rem)] w-80 min-w-[320px] max-w-[320px] flex-col rounded-2xl bg-[#0B1120]/75 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden transition-all"
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0" {...attributes} {...listeners}>
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${colStyle.dot} shadow-md ${colStyle.glow}`}
                        style={column.color && !COLUMN_COLORS[column.title] ? { backgroundColor: column.color } : undefined}
                    />
                    <h2 className="text-xs font-black text-white tracking-wider uppercase truncate">
                        {column.title}
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onAddTask?.(column.id)}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Додати задачу"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm("Видалити цю колонку? Усі задачі в ній також будуть видалені.")) {
                                    onRemoveColumn?.(column.id)
                                }
                            }}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Видалити колонку"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Column Body / Drop Container */}
            <div className="flex flex-1 flex-col gap-2.5 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 min-h-[150px]">
                <SortableContext items={tasks.map((t) => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            onView={onViewTask}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex flex-1 items-center justify-center p-6 border border-dashed border-white/5 rounded-xl">
                        <p className="text-[11px] font-medium text-slate-500 text-center">Немає задач</p>
                    </div>
                )}
            </div>
        </div>
    )
}
