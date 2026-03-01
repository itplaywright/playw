"use client"

import { useState } from "react"
import Link from "next/link"
import {
    LayoutGrid, Plus, ArrowRight, FolderOpen, Calendar,
    Terminal, BarChart2, Layers
} from "lucide-react"
import CreateProjectDialog from "./CreateProjectDialog"
import Sidebar from "@/components/layout/Sidebar"

interface Board {
    id: number
    title: string
    description: string | null
    createdAt: string | Date
}

interface Track {
    id: number
    title: string
    order: number | null
}

interface Props {
    initialBoards: Board[]
    isAdmin: boolean
    tracks: Track[]
    tasks: any[]
    statusMap: Record<number, any>
    userName?: string | null
    userImage?: string | null
    role?: {
        id: number
        name: string
        maxTrackOrder: number | null
    } | null
}

export default function ProjectsClient({
    initialBoards,
    isAdmin,
    tracks,
    tasks,
    statusMap,
    userName,
    userImage,
    role
}: Props) {
    const [boards, setBoards] = useState<Board[]>(initialBoards)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const getTrackProgress = (trackId: number) => {
        const tTasks = tasks.filter(t => t.trackId === trackId)
        const done = tTasks.filter(t => statusMap[t.id] === "Виконано").length
        return { done, total: tTasks.length }
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0
    const initials = userName ? userName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : 'U'

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Top Header */}
            <header className="flex-shrink-0 h-14 bg-[#0f172a] border-b border-white/10 flex items-center px-6 gap-6">
                <div className="flex items-center gap-2.5 mr-4">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight">IT Playwright</span>
                </div>

                <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
                    <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-blue-400 h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${overallPct}%` }}
                        />
                    </div>
                    <span className="text-slate-400 text-xs font-bold whitespace-nowrap">{overallPct}% курсу</span>
                </div>

                <div className="flex-1" />

                <Link href="/setup" className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                    <Layers className="w-3.5 h-3.5" />
                    Налаштування
                </Link>
                <Link href="/cabinet" className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                    <BarChart2 className="w-3.5 h-3.5" />
                    Кабінет
                </Link>

                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/80 flex items-center justify-center text-white text-xs font-black overflow-hidden">
                        {userImage
                            ? <img src={userImage} alt={userName ?? ''} className="w-8 h-8 object-cover" />
                            : initials
                        }
                    </div>
                    <span className="text-white text-xs font-medium hidden md:block max-w-[120px] truncate">{userName ?? 'Учень'}</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    tracks={tracks}
                    getTrackProgress={getTrackProgress}
                    isAdmin={isAdmin}
                    role={role}
                    currentPath="/projects"
                />

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <FolderOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ваші Проєкти</h1>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Project Management System</p>
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Новий Проєкт</span>
                                </button>
                            )}
                        </div>

                        {boards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <LayoutGrid className="w-8 h-8 text-slate-300" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Проєктів поки немає</h2>
                                <p className="text-slate-500 text-sm mt-1">Створіть свій перший проєкт, щоб почати роботу.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {boards.map((board) => (
                                    <Link
                                        key={board.id}
                                        href={`/projects/${board.id}`}
                                        className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/10 transition-all transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 transition-colors flex items-center justify-center">
                                                <LayoutGrid className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(board.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {board.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                            {board.description || "Опис відсутній"}
                                        </p>
                                        <div className="flex items-center text-blue-600 text-xs font-black uppercase tracking-widest gap-2">
                                            <span>Переглянути дошку</span>
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showCreateDialog && (
                <CreateProjectDialog
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={(id) => {
                        window.location.href = `/projects/${id}`
                    }}
                />
            )}
        </div>
    )
}
