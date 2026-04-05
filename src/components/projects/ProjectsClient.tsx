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
        hasPracticeAccess: boolean | null
    } | null
    allRoles: { id: number, name: string }[]
    allUsers: { id: string, name: string | null, email: string | null }[]
}

export default function ProjectsClient({
    initialBoards,
    isAdmin,
    tracks,
    tasks,
    statusMap,
    userName,
    userImage,
    role,
    allRoles,
    allUsers
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
        <div className="flex flex-col h-screen bg-[#020617] overflow-hidden font-sans relative">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Top Header */}
            <header className="flex-shrink-0 h-10 header-glass-premium flex items-center px-4 gap-6 z-50">
                <div className="flex items-center gap-2 mr-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Terminal className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs tracking-tight">IT Playwright</span>
                </div>

                <div className="hidden md:flex items-center gap-3 flex-1 max-w-[200px]">
                    <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden relative">
                        <div
                            className="progress-glow-blue animate-wave"
                            style={{ width: `${overallPct}%` }}
                        />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold whitespace-nowrap">{overallPct}%</span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-4">
                    <Link href="/setup" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all">
                        <Layers className="w-3 h-3" />
                        Налаштування
                    </Link>
                    <Link href="/cabinet" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all">
                        <BarChart2 className="w-3 h-3" />
                        Кабінет
                    </Link>
                </div>

                <div className="flex items-center gap-2 pl-4 border-l border-white/5 h-6">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/80 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                        {userImage
                            ? <img src={userImage} alt={userName ?? ''} className="w-6 h-6 rounded-lg object-cover" />
                            : initials
                        }
                    </div>
                </div>
            </header>

            {/* Below header: Sidebar + Main Content (Floating Layout) */}
            <div className="flex flex-1 overflow-hidden p-4 pt-2 gap-4 relative z-10">
                <div className="flex-shrink-0 w-80 rounded-[2rem] overflow-hidden glass-card-premium border border-white/5 shadow-2xl">
                    <Sidebar
                        tracks={tracks}
                        getTrackProgress={getTrackProgress}
                        isAdmin={isAdmin}
                        role={role}
                        currentPath="/projects"
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar glass-card-premium rounded-[2rem] border border-white/5 shadow-2xl relative p-8">
                    <div className="w-full relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-3xl glass-panel border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-500/10">
                                    <FolderOpen className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-white tracking-tight">Проєкти</h1>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Project Management System</p>
                                    </div>
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="badge-gradient-blue px-8 py-3.5 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Новий Проєкт</span>
                                </button>
                            )}
                        </div>

                        {boards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-[2rem] border-dashed">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                                    <LayoutGrid className="w-10 h-10 text-slate-700" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Проєктів поки немає</h2>
                                <p className="text-slate-500 text-sm max-w-[280px] text-center">Створіть свій перший проєкт, щоб почати роботу з Jira-дошками та задачами.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {boards.map((board, idx) => (
                                    <Link
                                        key={board.id}
                                        href={`/projects/${board.id}`}
                                        className="group relative block p-8 glass-card-premium-v2 glass-card-premium-hover rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] accent-glow-top border-t-blue-500/30"
                                    >
                                        {/* Mesh Gradient Glow */}
                                        <div className={`absolute -bottom-24 -left-24 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full ${idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'}`} />

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-500">
                                                    <LayoutGrid className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                    {new Date(board.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-3">
                                                {board.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 min-h-[44px]">
                                                {board.description || "Опис відсутній"}
                                            </p>
                                            <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity pt-6 border-t border-white/5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">Переглянути дошку</span>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-blue-500/30 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
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
                    allRoles={allRoles}
                    allUsers={allUsers}
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={(id) => {
                        window.location.href = `/projects/${id}`
                    }}
                />
            )}
        </div>
    )
}
