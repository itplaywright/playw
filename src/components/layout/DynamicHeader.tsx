"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User, LayoutGrid, Key, Bell } from "lucide-react"
import { logoutAction } from "@/app/actions"

const LANDING_MENU: MenuItem[] = [
    { id: -1, title: "Програма", url: "#curriculum", type: "internal", isVisible: true },
    { id: -2, title: "Як це працює", url: "#how-it-works", type: "internal", isVisible: true },
    { id: -3, title: "FAQ", url: "#faq", type: "internal", isVisible: true },
]

interface MenuItem {
    id: number
    title: string
    url: string
    type: "internal" | "external"
    isVisible: boolean
}

interface HeaderSettings {
    header_logo_url?: string
    header_platform_name?: string
    header_theme?: string
    header_visible?: string
}

export default function DynamicHeader({ user }: { user?: any }) {
    const [settings, setSettings] = useState<HeaderSettings>({})
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [unreadQuestions, setUnreadQuestions] = useState(0)
    const [unreadSubmissions, setUnreadSubmissions] = useState(0)
    const pathname = usePathname()

    const totalUnreadCount = unreadQuestions + unreadSubmissions

    const isTaskPage = pathname?.startsWith("/tasks/") || pathname?.startsWith("/projects/")
    const displayMenuItems = user
        ? menuItems.filter(item => !LANDING_MENU.some(l => l.url === item.url))
        : LANDING_MENU

    useEffect(() => {
        loadConfig()
        if (user) {
            fetchUnreadCount()
            const interval = setInterval(fetchUnreadCount, 60000)
            return () => clearInterval(interval)
        }
    }, [user])

    const fetchUnreadCount = async () => {
        try {
            const [qRes, sRes] = await Promise.all([
                fetch("/api/questions/unread-count"),
                fetch("/api/user/notifications")
            ])
            if (qRes.ok) {
                const data = await qRes.json()
                setUnreadQuestions(data.count)
            }
            if (sRes.ok) {
                const data = await sRes.json()
                setUnreadSubmissions(Array.isArray(data) ? data.length : 0)
            }
        } catch (err) {
            console.error("Error fetching unread count:", err)
        }
    }

    const loadConfig = async () => {
        try {
            const res = await fetch("/api/public/config")
            if (res.ok) {
                const data = await res.json()
                setSettings(data.settings || {})
                setMenuItems(data.menu || [])
            }
        } catch (error) {
            console.error("Error loading header config:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Don't render if header is hidden or on task pages
    if (settings.header_visible === "false" || isTaskPage) {
        return null
    }

    const isDark = true
    const bgClass = "bg-zinc-950/80 border-white/5"
    const textClass = "text-white"
    const linkClass = "text-zinc-400 hover:text-white"

    if (isLoading) {
        return (
            <header className={`sticky top-0 z-40 border-b ${bgClass} backdrop-blur-md`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="h-8 w-48 bg-gray-200/50 animate-pulse rounded"></div>
                        <div className="hidden md:flex space-x-6">
                            <div className="h-6 w-20 bg-gray-200/50 animate-pulse rounded"></div>
                            <div className="h-6 w-20 bg-gray-200/50 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className={`sticky top-0 z-40 border-b ${bgClass} backdrop-blur-md transition-all duration-300`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Platform Name */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        {settings.header_logo_url ? (
                            <div className="bg-white p-1.5 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                                <img
                                    src={settings.header_logo_url}
                                    alt="Logo"
                                    className="h-7 w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <span className="text-2xl">🎭</span>
                        )}
                        {user && (
                            <span className={`text-xl font-bold ${textClass} tracking-tight`}>
                                {settings.header_platform_name || "Playwright Platform"}
                            </span>
                        )}
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {user && (
                            <Link href="/projects" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${linkClass} flex items-center gap-2`}>
                                <LayoutGrid className="w-4 h-4" />
                                <span>Проєкти</span>
                            </Link>
                        )}
                        {displayMenuItems.map((item: MenuItem) => (
                            item.type === "internal" ? (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    className={`text-sm font-medium transition-all hover:-translate-y-0.5 ${linkClass}`}
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm font-medium transition-all hover:-translate-y-0.5 ${linkClass}`}
                                >
                                    {item.title}
                                </a>
                            )
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-2 pl-6 border-l border-border">
                                <Link
                                    href="/cabinet"
                                    className="flex items-center gap-3 pr-3 p-1.5 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group"
                                    title="Мій кабінет"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 relative group-hover:scale-105 transition-transform">
                                        {user.email?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                        
                                        {/* Notification Bell Badge on Avatar */}
                                        {totalUnreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center gap-0.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-zinc-950 animate-in zoom-in duration-300">
                                                <Bell className="w-2.5 h-2.5" />
                                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold leading-none ${textClass} group-hover:text-blue-400 transition-colors`}>
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                                            {user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                                        </span>
                                    </div>
                                </Link>
                                <Link
                                    href="/activate"
                                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all relative group/activate"
                                    title="Активація промокоду/доступу"
                                >
                                    <Key className="h-5 w-5 shadow-indigo-500/20" />
                                </Link>
                                <button
                                    onClick={() => logoutAction()}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Вийти"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/api/auth/signin" className={`text-sm font-bold ${linkClass}`}>Вхід</Link>
                                <Link href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">Реєстрація</Link>
                            </div>
                        )}
                    </div>


                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${linkClass}`}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="flex flex-col space-y-3">
                            {user && (
                                <Link
                                    href="/projects"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`font-bold transition-colors px-4 py-3 rounded-xl hover:bg-gray-50 ${linkClass} flex items-center gap-3`}
                                >
                                    <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                                    <span>Проєкти</span>
                                </Link>
                            )}
                            {displayMenuItems.map((item: MenuItem) => (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`font-medium transition-colors px-4 py-3 rounded-xl hover:bg-gray-50 ${linkClass}`}
                                >
                                    {item.title}
                                </Link>
                            ))}
                            {user && (
                                <div className="border-t border-gray-100 pt-3 mt-3 px-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                                            {user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{user.email}</span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Link href="/cabinet" onClick={() => setMobileMenuOpen(false)} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-2">
                                                    Мій кабінет
                                                    {totalUnreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold">
                                                            {totalUnreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link href="/activate" onClick={() => setMobileMenuOpen(false)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-2">
                                                    Активація коду
                                                </Link>
                                                <button onClick={() => logoutAction()} className="text-xs text-red-500 font-bold">Вийти</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    )
}
