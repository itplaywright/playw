"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X, Trash2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
    board: {
        id: number
        title: string
        description: string | null
    }
    onClose: () => void
    onSuccess: () => void
}

export default function EditProjectDialog({ board, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState(board.title)
    const [description, setDescription] = useState(board.description || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("Назва обов'язкова")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/projects/boards/${board.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            })

            if (res.ok) {
                toast.success("Проєкт оновлено")
                onSuccess()
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error("Помилка при оновленні")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/projects/boards/${board.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Проєкт видалено")
                router.push("/projects")
                router.refresh()
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error("Помилка при видаленні")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (showDeleteConfirm) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Ви впевнені?</h3>
                    <p className="text-slate-500 text-sm mb-8">
                        Це назавжди видалить проєкт <strong>{board.title}</strong> та всі його колонки та задачі. Цю дію неможливо скасувати.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Видалення..." : "Так, видалити все"}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Налаштування проєкту</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Назва проєкту</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 max-h-12 outline-none transition-all font-semibold text-slate-900 bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Опис</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium text-slate-900 bg-white"
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? "Збереження..." : "Зберегти зміни"}
                        </button>

                        <div className="h-px bg-slate-100 my-2" />

                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-4 bg-white border-2 border-red-50 hover:bg-red-50 text-red-500 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Видалити проєкт</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
