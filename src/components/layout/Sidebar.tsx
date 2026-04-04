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

interface Role {
    id: number
    name: string
    maxTrackOrder: number | null
}

interface SidebarProps {
    tracks: Track[]
    getTrackProgress: (trackId: number) => { done: number, total: number }
    selectedTrackId?: number
    setSelectedTrackId?: (id: number) => void
    isAdmin: boolean
    role?: Role | null
    currentPath: string
}

export default function Sidebar({
    tracks,
    getTrackProgress,
    selectedTrackId,
    setSelectedTrackId,
    isAdmin,
    role,
    currentPath
}: SidebarProps) {
    const isProTrack = (order: number | null) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 2 // Default to 2 if no role/sub
        return (order ?? 0) > maxOrder
    }

    return (
        <aside className="w-full h-full bg-slate-950/20 flex flex-col z-40">
            {/* Logo area */}
            <div className="px-6 py-6 border-b border-white/5 space-y-4">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs leading-tight tracking-tight">Playwright Course</p>
                        <p className="text-slate-500 text-[10px] font-medium">IT Automation Platform</p>
                    </div>
                </div>

                {/* User Plan Badge */}
                {role && (
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex flex-col gap-1 shadow-lg shadow-blue-900/10">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] opacity-80">Поточний доступ</span>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white tracking-tight">{role.name}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Track navigation */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Рівні курсу</p>

                {/* Setup link */}
                <Link
                    href="/setup"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${currentPath === "/setup"
                        ? "glass-panel text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        }`}
                >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Крок 0. Налаштування</span>
                </Link>

                <Link
                    href="/projects"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${currentPath === "/projects"
                        ? "glass-panel text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        }`}
                >
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Проєкти (Jira)</span>
                </Link>

                <div className="pt-4 pb-2 border-t border-white/5 mx-2 my-2" />

                {tracks.map(track => {
                    const { done, total } = getTrackProgress(track.id)
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const isSelected = track.id === selectedTrackId
                    const isPro = isProTrack(track.order)

                    const content = (
                        <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-center gap-2">
                                <span className={`text-[13px] font-bold truncate flex-1 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{track.title}</span>
                                {isPro && !isAdmin && (
                                    <Star className="w-3 h-3 star-gold-premium flex-shrink-0" />
                                )}
                            </div>
                            {/* Mini progress bar */}
                            <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? "bg-white/10" : "bg-white/5"}`}>
                                <div
                                    className={`h-1 rounded-full transition-all duration-1000 ${isSelected ? "bg-blue-500 animate-wave" : "bg-slate-700"}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-400" : "text-slate-600"}`}>
                                    {done}/{total} Done
                                </span>
                                {pct > 0 && (
                                    <span className={`text-[9px] font-bold ${isSelected ? "text-blue-400" : "text-slate-600"}`}>{pct}%</span>
                                )}
                            </div>
                        </div>
                    )

                    const baseClass = `flex flex-col gap-1.5 px-4 py-3 rounded-r-2xl transition-all duration-300 text-left group relative ${isSelected
                        ? "sidebar-active-item text-blue-400"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border-l-[3px] border-transparent"
                        }`

                    if (setSelectedTrackId) {
                        return (
                            <button
                                key={track.id}
                                onClick={() => setSelectedTrackId(track.id)}
                                className={baseClass}
                            >
                                {content}
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={track.id}
                            href={`/dashboard?trackId=${track.id}`}
                            className={baseClass}
                        >
                            {content}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom: cabinet link */}
            <div className="px-3 pb-6 border-t border-white/5 pt-4">
                <Link
                    href="/cabinet"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${currentPath === "/cabinet"
                        ? "glass-panel text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    Мій кабінет
                    <ArrowRight className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-100 transition-all" />
                </Link>
            </div>
        </aside>
    )
}
