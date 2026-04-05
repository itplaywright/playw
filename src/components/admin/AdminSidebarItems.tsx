"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    ChevronRight,
    LayoutDashboard,
    Layers,
    BookOpen,
    MessageCircle,
    Users,
    History,
    Send
} from "lucide-react"

const IconMap: Record<string, any> = {
    LayoutDashboard,
    Layers,
    BookOpen,
    MessageCircle,
    Users,
    History,
    Send
}

export default function AdminSidebarItems({ navigation }: { navigation: any[] }) {
    const [counts, setCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        fetchCounts()
        const interval = setInterval(fetchCounts, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchCounts = async () => {
        try {
            const [qRes, sRes] = await Promise.all([
                fetch("/api/admin/questions/unread-count"),
                fetch("/api/admin/submissions/unread-count")
            ])
            
            const counts: Record<string, number> = {}
            
            if (qRes.ok) {
                const data = await qRes.json()
                counts["/admin/questions"] = data.count
            }
            if (sRes.ok) {
                const data = await sRes.json()
                counts["/admin/submissions"] = data.count
            }
            
            setCounts(counts)
        } catch (err) {
            console.error("Error fetching admin counts:", err)
        }
    }

    return (
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
                const Icon = IconMap[item.icon] || LayoutDashboard

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2.5 text-sm font-black text-muted-foreground/80 rounded-xl hover:bg-secondary hover:text-foreground transition-all group relative tracking-tight"
                    >
                        <Icon className="mr-3 h-5 w-5 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        {item.name}
                        {counts[item.href] > 0 && (
                            <span className="ml-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shadow-red-600/20">
                                {counts[item.href]}
                            </span>
                        )}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                )
            })}
        </nav>
    )
}
