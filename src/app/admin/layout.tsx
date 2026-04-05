
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Layers,
    BookOpen,
    Users,
    History,
    Settings,
    LogOut,
    ChevronRight,
    MessageCircle,
    Send
} from "lucide-react"
import AdminSidebarItems from "@/components/admin/AdminSidebarItems"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user || (session.user as any).role !== "admin") {
        redirect("/")
    }

    const navigation = [
        { name: "Панель", href: "/admin", icon: "LayoutDashboard" },
        { name: "Треки", href: "/admin/tracks", icon: "Layers" },
        { name: "Завдання", href: "/admin/tasks", icon: "BookOpen" },
        { name: "Рев'ю коду", href: "/admin/submissions", icon: "Send" },
        { name: "Питання", href: "/admin/questions", icon: "MessageCircle" },
        { name: "Користувачі", href: "/admin/users", icon: "Users" },
        { name: "Спроби", href: "/admin/attempts", icon: "History" },
    ]

    const settingsNav = [
        { name: "Загальні", href: "/admin/settings/general" },
        { name: "Ролі", href: "/admin/roles" },
        { name: "Товари", href: "/admin/products" },
        { name: "Коди доступу", href: "/admin/access-codes" },
        { name: "Header", href: "/admin/settings/header" },
        { name: "Меню", href: "/admin/settings/menu" },
        { name: "Реклама", href: "/admin/settings/ads" },
        { name: "Теми", href: "/admin/settings/themes" },
    ]

    return (
        <div className="flex min-h-screen bg-background/50">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full shadow-xl shadow-black/[0.02] z-20 transition-all">
                <div className="h-20 flex items-center px-8 border-b border-border bg-secondary/20">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3">
                        <span className="text-sm">👑</span>
                    </div>
                    <span className="font-black text-lg text-foreground tracking-tighter uppercase">Admin CMS</span>
                </div>

                <AdminSidebarItems navigation={navigation} />

                <div className="px-4 py-6 space-y-2 border-t border-border/50">
                    <div className="flex items-center px-4 py-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Settings
                    </div>
                    {settingsNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-xs font-black text-muted-foreground/70 rounded-xl hover:bg-secondary hover:text-foreground transition-all tracking-tight"
                        >
                            <ChevronRight className="mr-2 h-3 w-3 opacity-30" />
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="p-4 mt-auto border-t border-border/50 mb-4 mx-2">
                    <div className="flex items-center p-3 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-all cursor-pointer group">
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-xs uppercase shadow-inner group-hover:scale-105 transition-transform">
                            {session.user.email?.[0]}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-[11px] font-black text-foreground truncate">{session.user.email}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Master Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Platform Management
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <Link
                            href="/dashboard"
                            className="text-[10px] font-black text-blue-600 hover:text-white uppercase tracking-widest bg-blue-500/10 hover:bg-blue-600 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Go to Console
                        </Link>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
