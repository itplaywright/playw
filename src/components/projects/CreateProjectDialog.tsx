"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
    allRoles: { id: number, name: string }[]
    allUsers: { id: string, name: string | null, email: string | null }[]
    onSuccess: (boardId: number) => void
    onClose: () => void
}

export default function CreateProjectDialog({ allRoles, allUsers, onSuccess, onClose }: Props) {
    const t = useTranslations("Projects")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error(t("taskTitleRequired"))
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/projects/boards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title, 
                    description,
                    allowedRoleIds: selectedRoleIds,
                    allowedUserIds: selectedUserIds
                }),
            })

            if (res.ok) {
                const board = await res.json()
                toast.success(t("projectCreated"))
                onSuccess(board.id)
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error(t("projectSaveError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{t("newProjectTitle")}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t("projectNameLabel")}</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("projectNamePlaceholder")}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold text-slate-900 bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t("projectDescLabel")}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("projectDescPlaceholder")}
                            rows={2}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm font-medium text-slate-900 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                                {t("roleAccessTitle")}
                                <span className="text-blue-500">{selectedRoleIds.length}</span>
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
                                {t("specificUsersTitle")}
                                <span className="text-emerald-500">{selectedUserIds.length}</span>
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
                                            <span className="text-[11px] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{user.name || t("anonymousUser")}</span>
                                            <span className="text-[9px] text-slate-400 truncate tracking-tight">{user.email}</span>
                                        </div>
                                    </label>
                                ))}
                                {allUsers.length === 0 && <p className="text-[10px] text-slate-400 italic">{t("noStudents")}</p>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? t("creatingProject") : t("createProjectBtn")}
                    </button>
                </form>
            </div>
        </div>
    )
}
