
"use client"

import { useState } from "react"
import {
    Plus,
    Pencil,
    Eye,
    EyeOff,
    Trash2,
    X,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Track {
    id: number
    title: string
    description: string | null
    isActive: boolean | null
    order: number | null
    taskCount?: number
}

export default function TracksClient({ initialTracks }: { initialTracks: any[] }) {
    const [tracks, setTracks] = useState(initialTracks)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTrack, setEditingTrack] = useState<Track | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        order: 0,
        isActive: true
    })

    const openModal = (track?: Track) => {
        if (track) {
            setEditingTrack(track)
            setFormData({
                title: track.title,
                description: track.description || "",
                order: track.order || 0,
                isActive: track.isActive ?? true
            })
        } else {
            setEditingTrack(null)
            setFormData({
                title: "",
                description: "",
                order: tracks.length,
                isActive: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingTrack(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const method = editingTrack ? "PATCH" : "POST"
            const body = editingTrack ? { id: editingTrack.id, ...formData } : formData

            const res = await fetch("/api/admin/tracks", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                router.refresh()
                closeModal()
                // Update local state temporarily or just rely on router.refresh()
                // For better UX we could refetch or update state
                window.location.reload() // Simple way to refresh all data after change
            }
        } catch (error) {
            console.error("Error saving track:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleStatus = async (track: Track) => {
        try {
            const res = await fetch("/api/admin/tracks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: track.id, isActive: !track.isActive })
            })
            if (res.ok) window.location.reload()
        } catch (error) {
            console.error("Error toggling status:", error)
        }
    }

    const deleteTrack = async (id: number) => {
        if (!confirm("Ви впевнені, що хочете видалити цей трек? Всі завдання в ньому залишаться без прив'язки.")) return

        try {
            const res = await fetch(`/api/admin/tracks?id=${id}`, { method: "DELETE" })
            if (res.ok) window.location.reload()
        } catch (error) {
            console.error("Error deleting track:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Управління треками</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-bold">Створюйте та редагуйте навчальні модулі</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Додати трек
                </button>
            </div>

            <div className="bg-card rounded-3xl shadow-md border border-border/60 overflow-hidden">
                <table className="min-w-full divide-y divide-border/60">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest w-10">#</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Назва</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Завдань</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Статус</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {tracks.map((track) => (
                            <tr key={track.id} className="hover:bg-secondary/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{track.order}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-foreground">{track.title}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{track.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                        {track.taskCount ?? 0} задач
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleStatus(track)}
                                        className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-lg transition-all ${track.isActive ? 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-muted-foreground bg-secondary hover:bg-secondary/80'}`}
                                    >
                                        {track.isActive ? <Eye className="mr-1.5 h-3.5 w-3.5" /> : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
                                        {track.isActive ? 'Активний' : 'Прихований'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(track)}
                                            className="p-2 text-muted-foreground/40 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteTrack(track.id)}
                                            className="p-2 text-muted-foreground/40 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
                            <h2 className="text-xl font-black text-foreground tracking-tight">
                                {editingTrack ? 'Редагувати трек' : 'Створити новий трек'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Назва треку</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    placeholder="Наприклад: Основи Playwright"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Опис</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-medium resize-none text-foreground text-sm"
                                    placeholder="Короткий опис того, чому навчиться студент..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Порядок</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center space-x-3 mb-3 cursor-pointer group">
                                        <div 
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`w-11 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-blue-600" : "bg-muted"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`} />
                                        </div>
                                        <span className="text-sm font-black text-foreground transition-colors tracking-tight">Активний</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-2xl font-black hover:bg-secondary/80 transition-all active:scale-95 text-sm"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 text-sm"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingTrack ? 'Зберегти зміни' : 'Створити трек')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
