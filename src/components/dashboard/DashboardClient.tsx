"use client"

import { useState } from "react"
import Link from "next/link"
import {
    BookOpen, Code2, ArrowRight, CheckCircle2, Clock, ChevronRight,
    BarChart2, Terminal, Layers, Star, Lock
} from "lucide-react"

interface Task {
    id: number
    title: string
    description: string
    type: "code" | "quiz"
    difficulty: string | null
    order: number | null
    isActive: boolean | null
    trackId: number | null
}

interface Track {
    id: number
    title: string
    description: string | null
    order: number | null
    isActive: boolean | null
}

interface TaskStatus {
    label: "Виконано" | "В процесі" | "Не розпочато"
}

interface Props {
    tracks: Track[]
    tasks: Task[]
    statusMap: Record<number, TaskStatus["label"]>
    isAdmin: boolean
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

export default function DashboardClient({ tracks, tasks, statusMap, isAdmin }: Props) {
    const [selectedTrackId, setSelectedTrackId] = useState<number>(tracks[0]?.id ?? 0)
    const [activeTab, setActiveTab] = useState<"quiz" | "code">("code")

    const selectedTrack = tracks.find(t => t.id === selectedTrackId)
    const trackTasks = tasks.filter(t => t.trackId === selectedTrackId)

    // Per-track progress
    const getTrackProgress = (trackId: number) => {
        const tTasks = tasks.filter(t => t.trackId === trackId)
        const done = tTasks.filter(t => statusMap[t.id] === "Виконано").length
        return { done, total: tTasks.length }
    }

    const filteredTasks = trackTasks.filter(t => t.type === activeTab)
    const quizCount = trackTasks.filter(t => t.type === "quiz").length
    const codeCount = trackTasks.filter(t => t.type === "code").length

    const isProTrack = (order: number | null) => (order ?? 0) >= 3

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-[#0f172a] flex flex-col">
                {/* Logo area */}
                <div className="px-6 py-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Playwright Course</p>
                            <p className="text-slate-400 text-xs">IT Automation Platform</p>
                        </div>
                    </div>
                </div>

                {/* Track navigation */}
                <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Рівні курсу</p>

                    {/* Setup link */}
                    <Link
                        href="/setup"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                    >
                        <Layers className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Крок 0. Налаштування</span>
                    </Link>

                    {tracks.map(track => {
                        const { done, total } = getTrackProgress(track.id)
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0
                        const isSelected = track.id === selectedTrackId
                        const isPro = isProTrack(track.order)

                        return (
                            <button
                                key={track.id}
                                onClick={() => setSelectedTrackId(track.id)}
                                className={`w-full flex flex-col gap-1.5 px-4 py-3 rounded-xl transition-all text-left ${isSelected
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold truncate flex-1">{track.title}</span>
                                    {isPro && !isAdmin && (
                                        <Star className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
                                    )}
                                </div>
                                {/* Mini progress bar */}
                                <div className={`w-full h-1 rounded-full ${isSelected ? "bg-blue-400/40" : "bg-slate-700"}`}>
                                    <div
                                        className={`h-1 rounded-full transition-all ${isSelected ? "bg-white" : "bg-blue-500"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                                    {done}/{total} виконано
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Bottom: cabinet link */}
                <div className="px-3 pb-5 border-t border-white/10 pt-4">
                    <Link
                        href="/cabinet"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
                    >
                        <BarChart2 className="w-4 h-4" />
                        Мій кабінет
                        <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {selectedTrack && (
                    <div className="p-8 max-w-4xl mx-auto">
                        {/* Track header */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                            {selectedTrack.title}
                                        </h1>
                                        {isProTrack(selectedTrack.order) && !isAdmin && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider">
                                                <Star className="w-2.5 h-2.5 fill-current" /> Pro
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-sm">{selectedTrack.description}</p>
                                </div>
                                {/* Track mini-stats */}
                                <div className="flex-shrink-0 bg-white rounded-2xl border border-slate-100 px-5 py-3 shadow-sm text-right">
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        {getTrackProgress(selectedTrackId).done}
                                        <span className="text-slate-300 font-bold">/{getTrackProgress(selectedTrackId).total}</span>
                                    </p>
                                    <p className="text-slate-400 text-xs font-semibold">виконано</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab("code")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "code"
                                    ? "bg-[#0f172a] text-white shadow-lg"
                                    : "bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-700"
                                    }`}
                            >
                                <Code2 className="w-4 h-4" />
                                Практика
                                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-black ${activeTab === "code" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    {codeCount}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("quiz")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "quiz"
                                    ? "bg-[#0f172a] text-white shadow-lg"
                                    : "bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-700"
                                    }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                Теорія
                                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-black ${activeTab === "quiz" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    {quizCount}
                                </span>
                            </button>
                        </div>

                        {/* Task list */}
                        {filteredTasks.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                <Code2 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium text-sm">
                                    У цьому рівні поки немає завдань типу "{activeTab === "code" ? "Практика" : "Теорія"}".
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTasks.map(task => {
                                    const statusLabel = statusMap[task.id] ?? "Не розпочато"
                                    const isDone = statusLabel === "Виконано"

                                    return (
                                        <Link
                                            key={task.id}
                                            href={`/tasks/${task.id}`}
                                            className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                                        >
                                            {/* Done indicator */}
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-100" : "bg-slate-100"}`}>
                                                {isDone
                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    : <Clock className="w-4 h-4 text-slate-400" />
                                                }
                                            </div>

                                            {/* Task number */}
                                            <span className="text-slate-300 text-xs font-mono font-bold w-8 flex-shrink-0">#{task.order}</span>

                                            {/* Title */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate group-hover:text-blue-600 transition-colors ${isDone ? "text-slate-400" : "text-slate-900"}`}>
                                                    {task.title}
                                                </p>
                                                <p className="text-slate-400 text-xs truncate mt-0.5">
                                                    {task.description.split('\n').find(l => l.trim() && !l.startsWith('#'))?.substring(0, 80) || ''}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[statusLabel]}`}>
                                                {statusLabel}
                                            </span>

                                            {/* Difficulty */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`w-2 h-2 rounded-full ${DIFFICULTY_COLORS[task.difficulty ?? "easy"]}`} />
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {DIFFICULTY_LABELS[task.difficulty ?? "easy"]}
                                                </span>
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
