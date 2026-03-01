"use client"

import { useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import Column from "./Column"
import TaskCard from "./TaskCard"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import CreateColumnDialog from "./CreateColumnDialog"
import TaskDialog from "./TaskDialog"

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
    initialTasks: Task[]
    columns: ColumnData[]
    isAdmin: boolean
    boardId: number
    users: any[]
}

export default function KanbanBoard({ initialTasks, columns, isAdmin, boardId, users }: Props) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [activeColumnId, setActiveColumnId] = useState<number | null>(null)
    const [showTaskDialog, setShowTaskDialog] = useState(false)
    const [showColumnDialog, setShowColumnDialog] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task)
            return
        }
    }

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeIdStr = active.id as string
        const overIdStr = over.id as string

        if (activeIdStr === overIdStr) return

        const activeId = parseInt(activeIdStr.split('-')[1])
        const overId = overIdStr.toString().startsWith('column-')
            ? parseInt(overIdStr.split('-')[1])
            : parseInt(overIdStr.split('-')[1])

        const isActiveATask = active.data.current?.type === "Task"
        const isOverATask = over.data.current?.type === "Task"
        const isOverAColumn = over.data.current?.type === "Column"

        if (!isActiveATask) return

        // Drop task over another task
        if (isActiveATask && isOverATask) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId)
                const newIndex = items.findIndex((t) => t.id === parseInt(overIdStr.split('-')[1]))

                if (items[oldIndex].columnId !== items[newIndex].columnId) {
                    const newItems = [...items]
                    newItems[oldIndex] = { ...newItems[oldIndex], columnId: items[newIndex].columnId }
                    return arrayMove(newItems, oldIndex, newIndex)
                }

                return arrayMove(items, oldIndex, newIndex)
            })
        }

        // Drop task over a column
        if (isActiveATask && isOverAColumn) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId)
                const colId = parseInt(overIdStr.split('-')[1])
                const newItems = [...items]
                newItems[oldIndex] = { ...newItems[oldIndex], columnId: colId }
                return arrayMove(newItems, oldIndex, oldIndex)
            })
        }
    }

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null)
        const { active, over } = event
        if (!over) return

        const activeId = parseInt((active.id as string).split('-')[1])
        const draggedTask = tasks.find(t => t.id === activeId)
        if (!draggedTask) return

        // Persist change to backend
        try {
            const res = await fetch(`/api/projects/tasks/${draggedTask.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnId: draggedTask.columnId }),
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success("Статус оновлено")
        } catch (error) {
            toast.error("Помилка збереження")
        }
    }

    return (
        <div className="flex h-full w-full items-start gap-4 overflow-x-auto p-4 scrollbar-hide">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-4">
                    {columns.sort((a, b) => (a.order || 0) - (b.order || 0)).map((col) => (
                        <Column
                            key={col.id}
                            column={col}
                            tasks={tasks.filter((t) => t.columnId === col.id)}
                            isAdmin={isAdmin}
                            onEditTask={(t) => {
                                setEditingTask(t)
                                setShowTaskDialog(true)
                            }}
                            onDeleteTask={async (id) => {
                                if (!confirm("Видалити цю задачу?")) return
                                try {
                                    const res = await fetch(`/api/projects/tasks/${id}`, { method: 'DELETE' })
                                    if (res.ok) {
                                        setTasks(prev => prev.filter(t => t.id !== id))
                                        toast.success("Видалено")
                                    }
                                } catch (e) { toast.error("Помилка") }
                            }}
                            onAddTask={(colId) => {
                                setActiveColumnId(colId)
                                setEditingTask(null)
                                setShowTaskDialog(true)
                            }}
                            onRemoveColumn={async (id) => {
                                try {
                                    const res = await fetch(`/api/projects/columns/${id}`, { method: 'DELETE' })
                                    if (res.ok) {
                                        toast.success("Колонку видалено")
                                        window.location.reload()
                                    }
                                } catch (e) { toast.error("Помилка при видаленні") }
                            }}
                        />
                    ))}

                    {isAdmin && (
                        <button
                            onClick={() => setShowColumnDialog(true)}
                            className="flex h-[150px] w-80 min-w-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-slate-400 hover:text-blue-600 gap-2 shrink-0"
                        >
                            <Plus className="w-8 h-8" />
                            <span className="font-black text-xs uppercase tracking-widest">Додати колонку</span>
                        </button>
                    )}
                </div>

                {typeof document !== 'undefined' && createPortal(
                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: { opacity: "0.5" },
                            },
                        }),
                    }}>
                        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {showColumnDialog && (
                <CreateColumnDialog
                    boardId={boardId}
                    onClose={() => setShowColumnDialog(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}

            {showTaskDialog && (
                <TaskDialog
                    boardId={boardId}
                    columnId={activeColumnId || (columns.length > 0 ? columns[0].id : 0)}
                    users={users}
                    task={editingTask as any}
                    onClose={() => {
                        setShowTaskDialog(false)
                        setEditingTask(null)
                    }}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    )
}
