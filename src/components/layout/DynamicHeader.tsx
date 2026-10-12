"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/i18n/routing"
import {
    Menu, X, LogOut, User, LayoutGrid, Key, Settings,
    ChevronDown, Terminal, BookOpen, FolderKanban, GraduationCap,
    Shield, CreditCard
} from "lucide-react"
import { logoutAction } from "@/app/actions"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useTranslations, useLocale } from "next-intl"

interface MenuItem {
    id: number
    title: string
    titleEn?: string
    titleRu?: string
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
    const t = useTranslations('Header')
    const locale = useLocale()

    const getMenuTitle = (item: MenuItem) => {
        if (locale === 'en' && item.titleEn) return item.titleEn
        if (locale === 'ru' && item.titleRu) return item.titleRu
        return item.title
    }

    const [settings, setSettings] = useState<HeaderSettings>({})
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [unreadQuestions, setUnreadQuestions] = useState(0)
    const [unreadSubmissions, setUnreadSubmissions] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const totalUnreadCount = unreadQuestions + unreadSubmissions
    const isTaskPage = pathname?.includes("/tasks/") || pathname?.includes("/projects/")

    useEffect(() => {
        loadConfig()
        if (user) {
            fetchUnreadCount()
            const interval = setInterval(fetchUnreadCount, 60000)
            return () => clearInterval(interval)
        }
    }, [user])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close profile dropdown on route change
    useEffect(() => {
        setIsProfileOpen(false)
        setMobileMenuOpen(false)
    }, [pathname])

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

    if (settings.header_visible === "false" || isTaskPage) {
        return null
    }

    const activeLocales = ['uk', 'en', 'ru'].filter(lang => settings[`lang_${lang}` as keyof HeaderSettings] !== "false")

    const isActive = (href: string) => {
        if (!pathname) return false
        // Strip locale prefix for comparison
        const clean = pathname.replace(/^\/(uk|en|ru)/, '')
        return clean === href || clean.startsWith(href + '/')
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <header className="sticky top-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
                    <div className="hidden md:flex gap-4">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
                    </div>
                    <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
                </div>
            </header>
        )
    }

    // ─── GUEST HEADER (not logged in) ────────────────────────
    if (!user) {
        return (
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            {settings.header_logo_url ? (
                                <img src={settings.header_logo_url} alt="Logo" className="h-7 w-auto" />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                                    <Terminal className="w-4.5 h-4.5 text-white" />
                                </div>
                            )}
                            <span className="text-base font-bold text-foreground tracking-tight hidden sm:block">
                                {settings.header_platform_name || "Playwright Platform"}
                            </span>
                        </Link>

                        {/* Landing menu items */}
                        <nav className="hidden md:flex items-center gap-1">
                            {menuItems.map((item: MenuItem) => {
                                const finalUrl = item.url.startsWith('#') ? `/${item.url}` : item.url
                                return item.type === "external" ? (
                                    <a
                                        key={item.id}
                                        href={finalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                                    >
                                        {getMenuTitle(item)}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.id}
                                        href={finalUrl as any}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                                    >
                                        {getMenuTitle(item)}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2">
                                <LanguageSwitcher activeLocales={activeLocales} />
                                <ThemeToggle />
                                <div className="h-5 w-px bg-border mx-1" />
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-[0.98]"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                            <div className="md:hidden flex items-center gap-2">
                                <LanguageSwitcher activeLocales={activeLocales} />
                                <ThemeToggle />
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                >
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu (guest) */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-4 space-y-1">
                            {menuItems.map((item: MenuItem) => {
                                const finalUrl = item.url.startsWith('#') ? `/${item.url}` : item.url
                                return (
                                    <Link
                                        key={item.id}
                                        href={finalUrl as any}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-all"
                                    >
                                        {getMenuTitle(item)}
                                    </Link>
                                )
                            })}
                            <div className="border-t border-border/50 pt-3 mt-3 flex flex-col gap-2">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-foreground rounded-xl hover:bg-muted/50">
                                    {t('login')}
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-center text-white bg-blue-600 rounded-xl">
                                    {t('register')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        )
    }

    // ─── AUTHENTICATED HEADER ────────────────────────────────
    const navLinks = [
        { href: "/dashboard", label: t('dashboard'), icon: LayoutGrid },
        { href: "/theory", label: t('theory'), icon: BookOpen },
        { href: "/projects", label: t('projects'), icon: FolderKanban },
        { href: "/cabinet", label: t('myDashboard'), icon: User },
        { href: "/pricing", label: t('pricing'), icon: CreditCard },
    ]

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
                : 'bg-background/60 backdrop-blur-xl border-b border-border/30'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                        {settings.header_logo_url ? (
                            <img src={settings.header_logo_url} alt="Logo" className="h-7 w-auto" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-shadow">
                                <Terminal className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <span className="text-sm font-bold text-foreground tracking-tight hidden lg:block">
                            {settings.header_platform_name || "Playwright Platform"}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
                        {navLinks.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href as any}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                                        active
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <link.icon className="w-3.5 h-3.5" />
                                    {link.label}
                                </Link>
                            )
                        })}
                        {user.role === 'admin' && (
                            <Link
                                href="/admin"
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                                    isActive('/admin')
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Shield className="w-3.5 h-3.5" />
                                {t('adminPanel')}
                            </Link>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1.5">
                            <LanguageSwitcher activeLocales={activeLocales} />
                            <ThemeToggle />
                        </div>

                        {/* Profile dropdown */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full transition-all ${
                                    isProfileOpen ? 'bg-muted' : 'hover:bg-muted/50'
                                }`}
                            >
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] relative">
                                    {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                                    {totalUnreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-background">
                                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-60 rounded-xl bg-popover border border-border shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-3 border-b border-border/50">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {user.firstName || user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-muted text-muted-foreground">
                                                {user.role === 'admin' ? t('admin') : t('student')}
                                            </span>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/cabinet" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                                <User className="w-4 h-4" />
                                                {t('myDashboard')}
                                            </Link>
                                            <Link href="/setup" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                                <Settings className="w-4 h-4" />
                                                {t('settings')}
                                            </Link>
                                            <Link href="/activate" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                                <Key className="w-4 h-4" />
                                                {t('activateCode')}
                                            </Link>
                                        </div>
                                        <div className="border-t border-border/50 pt-1">
                                            <button
                                                onClick={() => { setIsProfileOpen(false); logoutAction(); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {t('logout')}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <div className="md:hidden flex items-center gap-1.5">
                            <LanguageSwitcher activeLocales={activeLocales} />
                            <ThemeToggle />
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu (authenticated) */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-3 space-y-0.5">
                        {navLinks.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href as any}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                        active
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <link.icon className="w-4 h-4 shrink-0" />
                                    {link.label}
                                </Link>
                            )
                        })}
                        {user.role === 'admin' && (
                            <Link
                                href="/admin"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                    isActive('/admin')
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <Shield className="w-4 h-4 shrink-0" />
                                {t('adminPanel')}
                            </Link>
                        )}

                        <div className="border-t border-border/50 pt-3 mt-2">
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm relative">
                                    {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    {totalUnreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                                            {totalUnreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{user.firstName || user.email?.split('@')[0]}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                            <Link href="/cabinet" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
                                <User className="w-4 h-4" /> {t('myDashboard')}
                            </Link>
                            <Link href="/setup" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
                                <Settings className="w-4 h-4" /> {t('settings')}
                            </Link>
                            <Link href="/activate" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
                                <Key className="w-4 h-4" /> {t('activateCode')}
                            </Link>
                            <button
                                onClick={() => { setMobileMenuOpen(false); logoutAction(); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 rounded-xl mt-1"
                            >
                                <LogOut className="w-4 h-4" /> {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
