"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User, LayoutGrid, Key, Bell, Settings, ChevronDown, Terminal } from "lucide-react"
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
    const [isProfileOpen, setIsProfileOpen] = useState(false)
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
    const bgClass = "bg-[#0d1117] bg-opacity-80"
    const textClass = "text-white"
    const linkClass = "text-zinc-400 hover:text-white"

    if (isLoading) {
        return (
            <header className={`sticky top-0 z-50 border-b border-white/10 ${bgClass} backdrop-blur-[15px]`}>
                <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="h-8 w-48 bg-gray-600/20 animate-pulse rounded"></div>
                        <div className="hidden md:flex space-x-6">
                            <div className="h-6 w-20 bg-gray-600/20 animate-pulse rounded"></div>
                            <div className="h-6 w-20 bg-gray-600/20 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className={`sticky top-0 z-50 border-b border-white/10 ${bgClass} backdrop-blur-[15px] transition-all duration-300`}>
            <div className="w-full max-w-[1600px] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Platform Name */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        {settings.header_logo_url ? (
                            <img
                                src={settings.header_logo_url}
                                alt="Logo"
                                className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                                <Terminal className="w-4 h-4 text-white" />
                            </div>
                        )}
                        {user && (
                            <span className={`text-[15px] font-bold ${textClass} tracking-tight ml-1`}>
                                {settings.header_platform_name || "Playwright Platform"}
                            </span>
                        )}
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {user && (
                            <Link href="/projects" className={`text-[14px] font-medium transition-colors ${linkClass}`}>
                                Проєкти
                            </Link>
                        )}
                        {displayMenuItems.map((item: MenuItem) => (
                            item.type === "internal" ? (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    className={`text-[14px] font-medium transition-colors ${linkClass}`}
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-[14px] font-medium transition-colors ${linkClass}`}
                                >
                                    {item.title}
                                </a>
                            )
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4 relative">
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                    className="flex items-center gap-3 pl-3 py-1 hover:bg-white/5 rounded-full transition-all group"
                                >
                                    <div className="flex flex-col text-right">
                                        <span className={`text-[13px] font-bold leading-none ${textClass} group-hover:text-blue-400 transition-colors`}>
                                            {user.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(59,130,246,0.2)] relative group-hover:scale-105 transition-transform">
                                        {user.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                                        {totalUnreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0d1117]">
                                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0f141b] border border-white/10 shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-5 py-3 border-b border-white/5 mb-2">
                                                <p className="text-[13px] font-bold text-white truncate">{user.email}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{user.role === 'admin' ? 'Адміністратор' : 'Студент'}</p>
                                            </div>
                                            <Link href="/cabinet" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <LayoutGrid className="w-4 h-4" />
                                                Мій кабінет
                                            </Link>
                                            <Link href="/setup" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <Settings className="w-4 h-4" />
                                                Налаштування
                                            </Link>
                                            <Link href="/activate" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <Key className="w-4 h-4" />
                                                Активація коду
                                            </Link>
                                            <div className="border-t border-white/5 mt-2 pt-2">
                                                <button onClick={() => { setIsProfileOpen(false); logoutAction(); }} className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                    Вийти
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
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
