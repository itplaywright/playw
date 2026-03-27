"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    BookOpen, Code2, ArrowRight, CheckCircle2, Clock, ChevronRight,
    BarChart2, Terminal, Layers, Star, Lock, Bell, User, Settings, Search, LayoutGrid, Sparkles
} from "lucide-react"

import Sidebar from "@/components/layout/Sidebar"

interface Task {
    id: number
    title: string
    description: string
    type: "code" | "quiz"
    difficulty: string | null
    order: number | null
    isActive: boolean | null
    trackId: number | null
    options?: string[] | null
}

interface Track {
    id: number
    title: string
    description: string | null
    order: number | null
    isActive: boolean | null
}

interface Project {
    id: number
    title: string
    description: string | null
}

interface TaskStatus {
    label: "Виконано" | "В процесі" | "Не розпочато"
}

interface Props {
    tracks: Track[]
    tasks: Task[]
    statusMap: Record<number, TaskStatus["label"]>
    isAdmin: boolean
    userName?: string | null
    userImage?: string | null
    projects: Project[]
    role?: {
        id: number
        name: string
        maxTrackOrder: number | null
    } | null
}

const DIFFICULTY_LABELS: Record<string, string> = {
    easy: "Легко",
    medium: "Середньо",
    hard: "Складно",
}

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: "bg-emerald-500",
    medium: "bg-amber-500",
    hard: "bg-red-500",
}

const STATUS_STYLES: Record<string, string> = {
    "Виконано": "bg-emerald-100 text-emerald-700",
    "В процесі": "bg-blue-100 text-blue-700",
    "Не розпочато": "bg-slate-100 text-slate-500",
}

export default function DashboardClient({ tracks, tasks, statusMap, isAdmin, userName, userImage, projects, role }: Props) {
    const searchParams = useSearchParams()
    const urlTrackId = searchParams.get("trackId")
    const [selectedTrackId, setSelectedTrackId] = useState<number>(
        urlTrackId ? parseInt(urlTrackId) : (tracks[0]?.id ?? 0)
    )

    useEffect(() => {
        if (urlTrackId) {
            const id = parseInt(urlTrackId)
            if (!isNaN(id)) setSelectedTrackId(id)
        }
    }, [urlTrackId])

    const selectedTrack = tracks.find(t => t.id === selectedTrackId)
    const trackTasks = tasks.filter(t => t.trackId === selectedTrackId)


    // Per-track progress
    const getTrackProgress = (trackId: number) => {
        const tTasks = tasks.filter(t => t.trackId === trackId)
        const done = tTasks.filter(t => statusMap[t.id] === "Виконано").length
        return { done, total: tTasks.length }
    }

    const filteredTasks = trackTasks

    const isProTrack = (order: number | null) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 2
        return (order ?? 0) > maxOrder
    }

    const totalDone = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).done, 0)
    const totalAll = tracks.reduce((acc, t) => acc + getTrackProgress(t.id).total, 0)
    const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0
    const initials = userName ? userName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : 'U'

    return (
        <div className="flex flex-col h-screen bg-premium-dark overflow-hidden font-sans">
            {/* Top Header */}
            <header className="flex-shrink-0 h-10 header-glass-premium flex items-center px-4 gap-6 z-50">
                {/* Brand */}
                <div className="flex items-center gap-2 mr-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Terminal className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs tracking-tight">IT Playwright</span>
                </div>

                {/* Global progress */}
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

                {/* Quick nav */}
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

                {/* User avatar */}
                <div className="flex items-center gap-2 pl-4 border-l border-white/5 h-6">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/80 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                        {userImage
                            ? <img src={userImage} alt={userName ?? ''} className="w-6 h-6 rounded-lg object-cover" />
                            : initials
                        }
                    </div>
                </div>
            </header>

            {/* Below header: sidebar + main */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    tracks={tracks}
                    getTrackProgress={getTrackProgress}
                    selectedTrackId={selectedTrackId}
                    setSelectedTrackId={setSelectedTrackId}
                    isAdmin={isAdmin}
                    role={role}
                    currentPath="/dashboard"
                />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    {selectedTrack && (
                        <div className="p-8 w-full">
                            {/* Track header */}
                            <div className="mb-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                                                {selectedTrack.title}
                                            </h1>
                                            {isProTrack(selectedTrack.order) && !isAdmin && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-900/20">
                                                    <Star className="w-2.5 h-2.5 fill-current" /> Pro
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-base font-normal max-w-2xl leading-relaxed opacity-60 italic">{selectedTrack.description}</p>
                                    </div>
                                    {/* Track mini-stats */}
                                    <div className="flex-shrink-0 bg-[#131b2c] rounded-2xl border border-white/10 px-5 py-3 shadow-sm text-right">
                                        <p className="text-2xl font-extrabold text-white">
                                            {getTrackProgress(selectedTrackId).done}
                                            <span className="text-slate-300 font-bold">/{getTrackProgress(selectedTrackId).total}</span>
                                        </p>
                                        <p className="text-slate-400 text-xs font-semibold">виконано</p>
                                    </div>
                                </div>
                            </div>


                            {/* Task list */}
                            {projects.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ваші Проєкти (Jira)</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {projects.map((project, idx) => (
                                            <Link
                                                key={project.id}
                                                href={isProTrack(selectedTrack.order) ? "/pricing" : `/projects?boardId=${project.id}`}
                                                className="group relative block p-6 glass-card-premium glass-card-premium-hover rounded-[2rem] overflow-hidden"
                                            >
                                                {/* Mesh Gradient Glow */}
                                                <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                                                
                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
                                                            <LayoutGrid className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                                                            <ChevronRight className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{project.title}</h3>
                                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{project.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredTasks.length === 0 ? (
                                <div className="glass-panel rounded-3xl p-16 text-center">
                                    <Code2 className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-400 font-medium">
                                        У цьому рівні поки немає практичних завдань.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-6">
                                        <BookOpen className="w-4 h-4 text-slate-500" />
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Програма навчання</h2>
                                    </div>
                                    {filteredTasks.map(task => {
                                        const statusLabel = statusMap[task.id] ?? "Не розпочато"
                                        const isDone = statusLabel === "Виконано"
                                        const isInProgress = statusLabel === "В процесі"
                                        const isLocked = isProTrack(selectedTrack.order) && !isAdmin

                                        return (
                                            <Link
                                                key={task.id}
                                                href={isLocked ? "/pricing" : `/tasks/${task.id}`}
                                                className={`group flex items-center gap-8 p-8 glass-card-premium rounded-[2rem] relative overflow-hidden transition-all ${isLocked ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : 'glass-card-premium-hover active:scale-[0.98] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]'} ${isInProgress && !isLocked ? 'ring-2 ring-blue-500/30' : ''}`}
                                            >
                                                {/* Lesson number background */}
                                                <div className="lesson-number-bg">#{task.order}</div>
                                                {/* In Progress Glow */}
                                                {isInProgress && (
                                                    <div className="absolute inset-0 bg-blue-500/5 blur-xl animate-pulse" />
                                                )}

                                                <div className="relative z-10 flex items-center gap-6 w-full">
                                                    {/* Status indicator */}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone ? "badge-gradient-emerald shadow-lg shadow-emerald-500/20" : isInProgress ? "badge-gradient-blue shadow-lg shadow-blue-500/20" : "bg-white/5 border border-white/10 group-hover:border-white/20"}`}>
                                                        {isDone
                                                            ? <CheckCircle2 className="w-7 h-7 text-white" />
                                                            : isInProgress 
                                                                ? <Clock className="w-7 h-7 text-white" />
                                                                : <div className="w-2 h-2 rounded-full bg-slate-600" />
                                                        }
                                                    </div>

                                                    {/* Task Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 tracking-widest uppercase">РІВЕНЬ {selectedTrack.order} • ЗАВДАННЯ #{task.order}</span>
                                                                {/* Skill Tags */}
                                                                <div className="flex gap-1.5 ml-2">
                                                                    {task.type === 'code' && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-bold text-blue-400 uppercase tracking-tighter">DOM</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('selector') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-bold text-purple-400 uppercase tracking-tighter">Locators</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('hook') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Hooks</span>
                                                                    )}
                                                                    {task.title.toLowerCase().includes('api') && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-400 uppercase tracking-tighter">API</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_COLORS[task.difficulty ?? "easy"]}`} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`font-bold text-lg transition-colors ${isDone ? "text-slate-500" : "text-white group-hover:text-blue-300"}`}>
                                                                {task.title}
                                                            </h4>
                                                            {isLocked && !isDone && (
                                                                <Lock className="w-4 h-4 text-amber-500/80 star-gold-premium drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status badge */}
                                                    <span className={`hidden sm:flex shrink-0 ${isDone ? 'status-done-glass' : isInProgress ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest' : 'border-white/5 text-slate-500 bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest'}`}>
                                                        {statusLabel}
                                                    </span>

                                                    <div className="p-2 rounded-lg group-hover:bg-white/10 transition-all">
                                                        <ChevronRight className={`w-5 h-5 transition-all ${isDone ? 'text-slate-600' : 'text-slate-400 group-hover:text-white group-hover:translate-x-0.5'}`} />
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>{/* end sidebar+main row */}
        </div>
    )
}
