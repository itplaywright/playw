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
    History
} from "lucide-react"

const IconMap: Record<string, any> = {
    LayoutDashboard,
    Layers,
    BookOpen,
    MessageCircle,
    Users,
    History
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
            const res = await fetch("/api/admin/questions/unread-count")
            if (res.ok) {
                const data = await res.json()
                setCounts({ "/admin/questions": data.count })
            }
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
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all group relative"
                    >
                        <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        {item.name}
                        {counts[item.href] > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
