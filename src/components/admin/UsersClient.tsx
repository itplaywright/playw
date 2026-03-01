"use client"

import { useState } from "react"
import {
    User,
    Shield,
    ShieldOff,
    RefreshCcw,
    Search,
    Calendar,
    Award,
    Trash2,
    Crown
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserData {
    id: string
    email: string | null
    role: "user" | "admin" | null
    dynamicRoleId: number | null
    isBlocked: boolean | null
    createdAt: Date | null
    passedTasks: number
}

interface Role {
    id: number
    name: string
}

export default function UsersClient({ initialUsers, roles }: { initialUsers: UserData[], roles: Role[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<"all" | "admin" | "blocked">("all")
    const router = useRouter()

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter =
            filter === "all" ? true :
                filter === "admin" ? user.role === "admin" :
                    filter === "blocked" ? user.isBlocked : true

        return matchesSearch && matchesFilter
    })

    const toggleBlock = async (user: UserData) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, isBlocked: !user.isBlocked })
            })
            if (res.ok) {
                router.refresh()
                setUsers(users.map(u => u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u))
                toast.success(user.isBlocked ? "Користувача розблоковано" : "Користувача заблоковано")
            }
        } catch (error) {
            console.error("Error toggling block status:", error)
        }
    }

    const deleteUser = async (id: string) => {
        if (!confirm("Ви впевнені, що хочете видалити цього користувача? Цю дію неможливо скасувати.")) return

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                router.refresh()
                setUsers(users.filter(u => u.id !== id))
                toast.success("Користувача видалено")
            }
        } catch (error) {
            console.error("Error deleting user:", error)
        }
    }

    const resetProgress = async (userId: string) => {
        if (!confirm("Ви впевнені, що хочете скинути весь прогрес навчання цього користувача?")) return

        try {
            const res = await fetch("/api/admin/users/reset-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })

            if (res.ok) {
                router.refresh()
                setUsers(users.map(u => u.id === userId ? { ...u, passedTasks: 0 } : u))
                toast.success("Прогрес скинуто")
            }
        } catch (error) {
            console.error("Error resetting progress:", error)
        }
    }

    const updateUserRole = async (userId: string, roleId: string) => {
        try {
            const res = await fetch("/api/admin/users/role", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, dynamicRoleId: roleId === "none" ? null : parseInt(roleId) })
            })

            if (res.ok) {
                router.refresh()
                setUsers(users.map(u => u.id === userId ? { ...u, dynamicRoleId: roleId === "none" ? null : parseInt(roleId) } : u))
                toast.success("Роль користувача оновлено")
            } else {
                toast.error("Помилка при оновленні ролі")
            }
        } catch (error) {
            toast.error("Помилка при оновленні ролі")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Користувачі</h1>
                    <p className="text-sm text-gray-500 mt-1">Керуйте доступом та переглядайте прогрес студентів</p>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === "all" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Всі
                    </button>
                    <button
                        onClick={() => setFilter("admin")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === "admin" ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Адміни
                    </button>
                    <button
                        onClick={() => setFilter("blocked")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === "blocked" ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Заблоковані
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Пошук користувача за email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredUsers.map((user) => (
                    <div key={user.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md ${user.isBlocked ? 'opacity-75 grayscale' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="ml-4 overflow-hidden">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]" title={user.email || ""}>{user.email}</p>
                                        {user.role === 'admin' && (
                                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(user.createdAt!).toLocaleDateString('uk-UA')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-0.5">
                                <button
                                    onClick={() => resetProgress(user.id)}
                                    className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                    title="Скинути прогрес"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => toggleBlock(user)}
                                    className={`p-1.5 rounded-lg transition-all ${user.isBlocked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                    title={user.isBlocked ? "Розблокувати" : "Заблокувати"}
                                >
                                    {user.isBlocked ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Видалити"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Role selector */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Підписка / Роль</label>
                            <select
                                value={user.dynamicRoleId || "none"}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="none">Без підписки</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                    <Award className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                    Прогрес навчання
                                </span>
                                <span className="text-xs font-black text-blue-600">{user.passedTasks} задач вик.</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((user.passedTasks / 25) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <User className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                        <p>Користувачів не знайдено.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
