"use client"

import { useEffect } from "react"
import { ShieldCheck, X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"

interface Notification {
    id: number
    status: "reviewed" | "rejected"
    taskId: number
    taskTitle: string
    reviewedAt: string | null
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function GlobalMentorNotification() {
    const pathname = usePathname()
    const { data: notifications, mutate } = useSWR<Notification[]>("/api/user/notifications", fetcher, {
        refreshInterval: 30000,
        revalidateOnFocus: true
    })

    const markAsSeen = async (id: number) => {
        try {
            await fetch("/api/user/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId: id })
            })
            // Optimistic update
            mutate(prev => prev?.filter(n => n.id !== id), false)
        } catch (error) {
            console.error("Mark as seen error:", error)
        }
    }

    // Filter: only show submissions that have been actually reviewed (have reviewedAt)
    const validNotifications = Array.isArray(notifications)
        ? notifications.filter(n => n.reviewedAt != null)
        : []

    const currentNotification = validNotifications[0]

    const isCurrentTaskPage = currentNotification
        ? pathname === `/tasks/${currentNotification.taskId}`
        : false

    // ✅ FIX: auto-mark as seen in useEffect, NOT in render body
    useEffect(() => {
        if (isCurrentTaskPage && currentNotification) {
            markAsSeen(currentNotification.id)
        }
    }, [isCurrentTaskPage, currentNotification?.id])

    if (!currentNotification || isCurrentTaskPage) return null

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentNotification.id}
                initial={{ opacity: 0, scale: 0.9, y: 20, x: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="fixed bottom-24 right-6 z-[100] max-w-sm w-full"
            >
                <div className={`p-6 rounded-[2.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden ${
                    currentNotification.status === 'reviewed'
                    ? 'bg-emerald-950/80 border-emerald-500/30'
                    : 'bg-red-950/80 border-red-500/30'
                }`}>
                    {/* Background glow */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20 ${
                        currentNotification.status === 'reviewed' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />

                    <button
                        onClick={() => markAsSeen(currentNotification.id)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/40 transition-colors"
                        aria-label="Закрити"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-5 relative z-10">
                        <div className={`p-4 rounded-2xl shadow-lg ${
                            currentNotification.status === 'reviewed'
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20'
                            : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                        }`}>
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none mb-2">Фідбек Ментора</h4>
                            <p className="text-white/70 text-xs font-medium leading-relaxed mb-5">
                                Ментор перевірив вашу роботу:{" "}
                                <span className="text-white font-black">"{currentNotification.taskTitle}"</span>
                            </p>
                            <Link
                                href={`/tasks/${currentNotification.taskId}`}
                                onClick={() => markAsSeen(currentNotification.id)}
                                className="flex-1 bg-white hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 group w-full"
                                style={{ color: currentNotification.status === 'reviewed' ? '#065f46' : '#991b1b' }}
                            >
                                Переглянути <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
