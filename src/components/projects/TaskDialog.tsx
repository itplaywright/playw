"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Plus, X, User, AlertCircle } from "lucide-react"

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

interface Props {
    boardId: number
    columnId: number
    users: User[]
    task?: Task // Optional task for editing
    onSuccess: () => void
    onClose: () => void
}

export default function TaskDialog({ boardId, columnId, users, task, onSuccess, onClose }: Props) {
    const [title, setTitle] = useState(task?.title || "")
    const [description, setDescription] = useState(task?.description || "")
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">(task?.priority || "medium")
    const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId || "")
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                    columnId,
                    title,
                    description,
                    priority,
                    assigneeId: assigneeId || null,
                }),
            })

            if (res.ok) {
                toast.success(isEditing ? "Задачу оновлено" : "Задачу створено")
                onSuccess()
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {task ? "Редагувати задачу" : "Нова задача"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Назва задачі</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Наприклад: Реалізувати авторизацію"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold text-slate-900 bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Опис (Markdown)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Деталі завдання..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm font-medium text-slate-900 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Пріоритет</label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all appearance-none bg-slate-50 font-bold text-sm text-slate-900"
                                >
                                    <option value="low">Низький</option>
                                    <option value="medium">Середній</option>
                                    <option value="high">Високий</option>
                                    <option value="critical">Критичний</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Виконавець</label>
                            <div className="relative">
                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all appearance-none bg-slate-50 font-bold text-sm text-slate-900"
                                >
                                    <option value="">Не призначено</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Збереження..." : (task ? "Оновити задачу" : "Створити задачу")}
                    </button>
                </form>
            </div>
        </div>
    )
}
