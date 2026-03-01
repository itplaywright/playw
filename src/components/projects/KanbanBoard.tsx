"use client"

import { useState, useMemo } from "react"
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import Column from "./Column"
import TaskCard from "./TaskCard"
import { createPortal } from "react-dom"
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
}

export default function KanbanBoard({ initialTasks, columns, isAdmin, boardId }: Props) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeTask, setActiveTask] = useState<Task | null>(null)

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

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveATask = active.data.current?.type === "Task"
        const isOverATask = over.data.current?.type === "Task"

        if (!isActiveATask) return

        // Drop task over another task
        if (isActiveATask && isOverATask) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId)
                const newIndex = items.findIndex((t) => t.id === overId)

                if (items[oldIndex].columnId !== items[newIndex].columnId) {
                    const newItems = [...items]
                    newItems[oldIndex] = { ...newItems[oldIndex], columnId: items[newIndex].columnId }
                    return arrayMove(newItems, oldIndex, newIndex)
                }

                return arrayMove(items, oldIndex, newIndex)
            })
        }

        // Drop task over a column
        const isOverAColumn = over.data.current?.type === "Column"
        if (isActiveATask && isOverAColumn) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId)
                const newItems = [...items]
                newItems[oldIndex] = { ...newItems[oldIndex], columnId: overId as number }
                return arrayMove(newItems, oldIndex, oldIndex)
            })
        }
    }

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null)
        const { active, over } = event
        if (!over) return

        const activeTask = tasks.find(t => t.id === active.id)
        if (!activeTask) return

        // Persist change to backend
        try {
            const res = await fetch(`/api/projects/tasks/${activeTask.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnId: activeTask.columnId }),
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success("Статус оновлено")
        } catch (error) {
            toast.error("Помилка збереження")
            // Ideally rollback UI state here
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
                    <SortableContext items={tasks.map(t => t.id)}>
                        {columns.map((col) => (
                            <Column
                                key={col.id}
                                column={col}
                                tasks={tasks.filter((t) => t.columnId === col.id)}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </SortableContext>
                </div>

                {typeof document !== 'undefined' && createPortal(
                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: "0.5",
                                },
                            },
                        }),
                    }}>
                        {activeTask ? (
                            <TaskCard task={activeTask} isOverlay />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    )
}
