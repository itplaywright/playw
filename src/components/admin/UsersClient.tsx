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
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Користувачі</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Керуйте доступом та переглядайте прогрес студентів</p>
                </div>
                <div className="flex bg-card border border-border rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${filter === "all" ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Всі
                    </button>
                    <button
                        onClick={() => setFilter("admin")}
                        className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${filter === "admin" ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Адміни
                    </button>
                    <button
                        onClick={() => setFilter("blocked")}
                        className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${filter === "blocked" ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Заблоковані
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                    type="text"
                    placeholder="Пошук користувача за email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground placeholder:text-muted-foreground/30 font-black text-sm"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredUsers.map((user) => (
                    <div key={user.id} className={`bg-card rounded-3xl p-6 shadow-md border border-border/60 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group ${user.isBlocked ? 'opacity-75 grayscale' : ''}`}>
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="ml-4 overflow-hidden">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-black text-foreground truncate max-w-[120px]" title={user.email || ""}>{user.email}</p>
                                        {user.role === 'admin' && (
                                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-black flex items-center mt-0.5 tracking-tight">
                                        <Calendar className="h-3 w-3 mr-1.5 opacity-50" />
                                        {new Date(user.createdAt!).toLocaleDateString('uk-UA')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => resetProgress(user.id)}
                                    className="p-2 text-muted-foreground/40 hover:text-orange-600 hover:bg-orange-500/10 rounded-xl transition-all"
                                    title="Скинути прогрес"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => toggleBlock(user)}
                                    className={`p-2 rounded-xl transition-all ${user.isBlocked ? 'text-red-600 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground/40 hover:text-red-600 hover:bg-red-500/10'}`}
                                    title={user.isBlocked ? "Розблокувати" : "Заблокувати"}
                                >
                                    {user.isBlocked ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="p-2 text-muted-foreground/40 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                                    title="Видалити"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Role selector */}
                        <div className="mb-5">
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1 tracking-widest">Підписка / Роль</label>
                            <select
                                value={user.dynamicRoleId || "none"}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs font-black text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            >
                                <option value="none">Без підписки</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-5 border-t border-border/50">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest flex items-center">
                                    <Award className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                    Progress
                                </span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.passedTasks} tasks done</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    style={{ width: `${Math.min((user.passedTasks / 25) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground/50">
                        <User className="mx-auto h-16 w-16 opacity-10 mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Користувачів не знайдено</p>
                    </div>
                )}
            </div>
        </div>
    )
}
