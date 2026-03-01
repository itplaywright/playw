"use client"

import Link from "next/link"
import {
    Terminal, Layers, LayoutGrid, BarChart2, Star, ArrowRight
} from "lucide-react"

interface Track {
    id: number
    title: string
    order: number | null
}

interface SidebarProps {
    tracks: Track[]
    getTrackProgress: (trackId: number) => { done: number, total: number }
    selectedTrackId?: number
    setSelectedTrackId?: (id: number) => void
    isAdmin: boolean
    currentPath: string
}

export default function Sidebar({
    tracks,
    getTrackProgress,
    selectedTrackId,
    setSelectedTrackId,
    isAdmin,
    currentPath
}: SidebarProps) {
    const isProTrack = (order: number | null) => (order ?? 0) >= 3

    return (
        <aside className="w-64 flex-shrink-0 bg-[#0f172a] flex flex-col h-full">
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${currentPath === "/setup"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Крок 0. Налаштування</span>
                </Link>

                <Link
                    href="/projects"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${currentPath === "/projects"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Проєкти (Jira)</span>
                </Link>

                {tracks.map(track => {
                    const { done, total } = getTrackProgress(track.id)
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const isSelected = track.id === selectedTrackId
                    const isPro = isProTrack(track.order)

                    return (
                        <button
                            key={track.id}
                            onClick={() => setSelectedTrackId?.(track.id)}
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${currentPath === "/cabinet"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    Мій кабінет
                    <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
            </div>
        </aside>
    )
}
