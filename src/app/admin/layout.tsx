
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
    ]

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-2xl mr-2">👑</span>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">Admin CMS</span>
                </div>

                <AdminSidebarItems navigation={navigation} />

                <div className="px-4 py-4 space-y-1">
                    <div className="flex items-center px-3 py-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <Settings className="mr-2 h-4 w-4" />
                        Налаштування
                    </div>
                    {settingsNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-3 py-2 ml-6 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center p-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {session.user.email?.[0]}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{session.user.email}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">Керування платформою</h2>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            До платформи
                        </Link>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
