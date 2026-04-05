"use client"

import Link from "next/link"
import {
    Terminal, Layers, LayoutGrid, BarChart2, Star, ArrowRight, Lock
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
    overallPct?: number
}

export default function Sidebar({
    tracks,
    getTrackProgress,
    selectedTrackId,
    setSelectedTrackId,
    isAdmin,
    role,
    currentPath,
    overallPct
}: SidebarProps) {
    const isProTrack = (order: number | null) => {
        if (isAdmin) return false
        const maxOrder = role?.maxTrackOrder ?? 1 // allow up to Level 1 by default
        return (order ?? 0) > maxOrder            // order 2+ is locked for maxOrder=1
    }

    return (
        <aside className="w-full h-full bg-secondary/5 flex flex-col z-40">
            {/* Logo area */}
            <div className="px-6 pt-2 pb-4 border-b border-border/50 space-y-3">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-foreground font-bold text-xs leading-tight tracking-tight">Playwright Course</p>
                        <p className="text-muted-foreground text-[10px] font-medium">IT Automation Platform</p>
                    </div>
                </div>

                {/* User Plan Badge */}
                {role ? (
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex flex-col gap-1 shadow-lg shadow-blue-500/5 dark:shadow-blue-900/10">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] opacity-80">Поточний доступ</span>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground tracking-tight">{role.name}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 flex flex-col gap-1 shadow-lg shadow-amber-500/5 dark:shadow-amber-900/10">
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] opacity-80">Доступ</span>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground tracking-tight">Демо-режим</span>
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>
                )}
                
                {/* Thin Overall Progress Bar */}
                {overallPct !== undefined && (
                    <div className="w-full flex flex-col gap-1.5 mt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Прогрес курсу</span>
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{overallPct}%</span>
                        </div>
                        <div className="w-full h-[3px] bg-secondary border border-border/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${overallPct}%` }} />
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/setup"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate tracking-wide">Крок 0. Налаштування</span>
                </Link>

                <Link
                    href="/projects"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/projects"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                >
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate tracking-wide">Проєкти (Jira)</span>
                </Link>

                <div className="pt-4 pb-2 border-t border-border mx-2 my-2" />

                {tracks.map(track => {
                    const { done, total } = getTrackProgress(track.id)
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const isSelected = track.id === selectedTrackId
                    const isPro = isProTrack(track.order)

                    const content = (
                        <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold tracking-wide truncate flex-1 ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{track.title}</span>
                                {isPro && !isAdmin && (
                                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                )}
                            </div>
                            {/* Mini progress bar */}
                            <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? "bg-primary/20" : "bg-secondary"}`}>
                                <div
                                    className={`h-1 rounded-full transition-all duration-1000 ${isSelected ? "bg-blue-600 dark:bg-blue-500 animate-wave" : "bg-muted-foreground/30"}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/60"}`}>
                                    {done}/{total} Done
                                </span>
                                {pct > 0 && (
                                    <span className={`text-[9px] font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/60"}`}>{pct}%</span>
                                )}
                            </div>
                        </div>
                    )

                    const baseClass = `flex flex-col gap-1.5 px-4 py-3 rounded-r-2xl transition-all duration-300 text-left group relative ${isSelected
                        ? "sidebar-active-item text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-[3px] border-transparent"
                        } ${isPro && !isAdmin ? "opacity-60 grayscale" : ""}`

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
            <div className="px-3 pb-6 border-t border-border pt-4">
                <Link
                    href="/cabinet"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${currentPath === "/cabinet"
                        ? "glass-panel text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    <span className="tracking-wide">Мій кабінет</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-100 transition-all" />
                </Link>
            </div>
        </aside>
    )
}
