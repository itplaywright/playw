"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import TaskCard from "./TaskCard"
import { Plus } from "lucide-react"

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
}

export default function Column({ column, tasks, isAdmin }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: true, // Don't sort columns for now
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex h-full w-80 min-w-[320px] flex-col rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm"
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-4 bg-white/40 rounded-t-xl border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: column.color || '#94a3b8' }}
                    />
                    <h2 className="text-sm font-bold text-slate-700 tracking-tight uppercase">
                        {column.title}
                    </h2>
                    <span className="ml-1 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                        {tasks.length}
                    </span>
                </div>
                {isAdmin && (
                    <button className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Column Body */}
            <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto scrollbar-hide min-h-[150px]">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} isAdmin={isAdmin} />
                ))}
            </div>
        </div>
    )
}
