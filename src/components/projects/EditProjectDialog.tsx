"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { X, Trash2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
    board: {
        id: number
        title: string
        description: string | null
    }
    allRoles: { id: number, name: string }[]
    allUsers: { id: string, name: string | null, email: string | null }[]
    onClose: () => void
    onSuccess: () => void
}

export default function EditProjectDialog({ board, allRoles, allUsers, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState(board.title)
    const [description, setDescription] = useState(board.description || "")
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchCurrentAccess = async () => {
            try {
                const res = await fetch(`/api/projects/boards/${board.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setSelectedRoleIds(data.allowedRoles?.map((r: any) => r.roleId) || [])
                    setSelectedUserIds(data.allowedUsers?.map((u: any) => u.userId) || [])
                }
            } catch (error) {
                console.error("Failed to fetch project access", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCurrentAccess()
    }, [board.id])

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
                body: JSON.stringify({ 
                    title, 
                    description,
                    allowedRoleIds: selectedRoleIds,
                    allowedUserIds: selectedUserIds
                }),
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
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Опис</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Про що цей проєкт..."
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium text-slate-900 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                                Доступ Ролям
                                {isLoading ? <span className="animate-pulse">...</span> : <span className="text-blue-500">{selectedRoleIds.length}</span>}
                            </label>
                            <div className="h-32 overflow-y-auto p-3 rounded-2xl border border-slate-100 bg-slate-50 space-y-1.5 custom-scrollbar">
                                {allRoles.map(role => (
                                    <label key={role.id} className="flex items-center gap-2 group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoleIds.includes(role.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedRoleIds(prev => [...prev, role.id])
                                                else setSelectedRoleIds(prev => prev.filter(id => id !== role.id))
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                                Конкретні Юзери
                                {isLoading ? <span className="animate-pulse">...</span> : <span className="text-emerald-500">{selectedUserIds.length}</span>}
                            </label>
                            <div className="h-32 overflow-y-auto p-3 rounded-2xl border border-slate-100 bg-slate-50 space-y-1.5 custom-scrollbar">
                                {allUsers.map(user => (
                                    <label key={user.id} className="flex items-center gap-2 group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedUserIds(prev => [...prev, user.id])
                                                else setSelectedUserIds(prev => prev.filter(id => id !== user.id))
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{user.name || 'Анонім'}</span>
                                            <span className="text-[9px] text-slate-400 truncate tracking-tight">{user.email}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
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
