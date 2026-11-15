"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { X } from "lucide-react"

interface Props {
    boardId: number
    onSuccess: () => void
    onClose: () => void
}

const PRESET_COLORS = [
    { label: "Slate", value: "#94a3b8" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Purple", value: "#a855f7" },
    { label: "Emerald", value: "#10b981" },
    { label: "Amber", value: "#f59e0b" },
    { label: "Rose", value: "#f43f5e" },
]

export default function CreateColumnDialog({ boardId, onSuccess, onClose }: Props) {
    const [mounted, setMounted] = useState(false)
    const [title, setTitle] = useState("")
    const [color, setColor] = useState("#3b82f6")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    if (!mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0B1120] border border-white/15 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-white my-auto">
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-base font-black text-white tracking-tight">Нова колонка</h2>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Назва колонки</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Наприклад: Blocked"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-sm outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Колір</label>
                        <div className="flex items-center gap-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-7 h-7 rounded-full transition-transform ${color === c.value ? "scale-125 ring-2 ring-white" : "hover:scale-110"}`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? "Додавання..." : "Додати колонку"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    )
}
