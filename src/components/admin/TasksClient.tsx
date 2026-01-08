
"use client"

import { useState } from "react"
import {
    Plus,
    Pencil,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    BarChart2,
    Search,
    Filter,
    X,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Task {
    id: number
    title: string
    trackId: number | null
    trackTitle: string | null
    difficulty: "easy" | "medium" | "hard" | null
    isActive: boolean | null
    order: number | null
    successRate: number | null
}

export default function TasksClient({ initialTasks, tracks }: { initialTasks: any[], tracks: any[] }) {
    const [tasks, setTasks] = useState(initialTasks)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterTrack, setFilterTrack] = useState<number | "all">("all")
    const router = useRouter()

    const difficultyColors: Record<string, string> = {
        easy: "bg-green-100 text-green-700 border-green-200",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
        hard: "bg-red-100 text-red-700 border-red-200",
    }

    const difficultyLabels: Record<string, string> = {
        easy: "Легко",
        medium: "Середньо",
        hard: "Складно",
    }

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTrack = filterTrack === "all" || task.trackId === filterTrack
        return matchesSearch && matchesTrack
    })

    const toggleStatus = async (task: any) => {
        try {
            const res = await fetch("/api/admin/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: task.id, isActive: !task.isActive })
            })
            if (res.ok) window.location.reload()
        } catch (error) {
            console.error("Error toggling task status:", error)
        }
    }

    const deleteTask = async (id: number) => {
        if (!confirm("Ви впевнені, що хочете видалити це завдання?")) return
        try {
            const res = await fetch(`/api/admin/tasks?id=${id}`, { method: "DELETE" })
            if (res.ok) window.location.reload()
        } catch (error) {
            console.error("Error deleting task:", error)
        }
    }

    const copyTask = async (task: any) => {
        try {
            const res = await fetch("/api/admin/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `${task.title} (Копія)`,
                    description: task.description,
                    trackId: task.trackId,
                    difficulty: task.difficulty,
                    initialCode: task.initialCode,
                    order: (task.order || 0) + 1,
                    isActive: false
                })
            })
            if (res.ok) window.location.reload()
        } catch (error) {
            console.error("Error copying task:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Управління завданнями</h1>
                    <p className="text-sm text-gray-500 mt-1">Керуйте контентом та складністю навчання</p>
                </div>
                <button
                    onClick={() => router.push('/admin/tasks/new')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Нове завдання
                </button>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Пошук завдань..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterTrack}
                        onChange={(e) => setFilterTrack(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Усі треки</option>
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>{track.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Завдання</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Складність</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Успішність</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{task.order}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{task.title}</div>
                                    <div className="text-xs text-blue-600 font-medium">{task.trackTitle}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${difficultyColors[task.difficulty || 'easy']}`}>
                                        {difficultyLabels[task.difficulty || 'easy']}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm font-bold text-gray-700">
                                        <BarChart2 className="mr-1.5 h-4 w-4 text-gray-400" />
                                        {task.successRate ?? 0}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleStatus(task)}
                                        className={`inline-flex items-center text-xs font-bold transition-colors ${task.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'}`}
                                    >
                                        {task.isActive ? <Eye className="mr-1 h-3.5 w-3.5" /> : <EyeOff className="mr-1 h-3.5 w-3.5" />}
                                        {task.isActive ? 'Активне' : 'Вимкнено'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => copyTask(task)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Копіювати"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/tasks/edit/${task.id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Редагувати"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Видалити"
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
        </div>
    )
}
