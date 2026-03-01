"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"

interface Props {
    boardId: number
    onSuccess: () => void
    onClose: () => void
}

export default function CreateColumnDialog({ boardId, onSuccess, onClose }: Props) {
    const [title, setTitle] = useState("")
    const [color, setColor] = useState("#94a3b8")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("Назва обов'язкова")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/projects/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ boardId, title, color }),
            })

            if (res.ok) {
                toast.success("Колонку додано")
                onSuccess()
                onClose()
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error("Помилка при додаванні")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Нова колонка</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Назва колонки</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Наприклад: Тестування"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 max-h-12 outline-none transition-all font-semibold text-slate-900 bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Колір</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full h-12 p-1 rounded-2xl border border-slate-200 cursor-pointer bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? "Додавання..." : "Додати колонку"}
                    </button>
                </form>
            </div>
        </div>
    )
}
