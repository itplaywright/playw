"use client"

import { useState, useMemo } from "react"
import {
    User as UserIcon,
    Shield,
    ShieldOff,
    RefreshCcw,
    Search,
    Calendar,
    Award,
    Trash2,
    Crown,
    Mail,
    Phone,
    Send,
    ExternalLink,
    Copy,
    Check,
    Download,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    X,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    UserCheck,
    Lock,
    ShieldCheck,
    KeyRound,
    Wand2,
    Eye,
    EyeOff
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale } from "next-intl"

export interface UserData {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    phone: string | null
    telegram: string | null
    whatsapp: string | null
    learningPath: "theory" | "practice" | null
    programmingLanguage: string | null
    role: "user" | "admin" | null
    dynamicRoleId: number | null
    isBlocked: boolean | null
    createdAt: Date | string | null
    passedTasks: number
}

export interface Role {
    id: number
    name: string
}

interface UsersClientProps {
    initialUsers: UserData[]
    roles: Role[]
    totalTasks: number
}

const translations = {
    ru: {
        title: "Пользователи",
        subtitle: "Управление доступом, ролями и детальный прогресс студентов",
        searchPlaceholder: "Поиск по email, имени, telegram...",
        totalUsers: "Всего пользователей",
        activeStudents: "Активные студенты",
        admins: "Администраторы",
        withSubscription: "С подпиской",
        blocked: "Заблокированные",
        filterAll: "Все",
        filterActive: "Активные",
        filterAdmins: "Админы",
        filterSubscribed: "С подпиской",
        filterBlocked: "Заблокированные",
        allPlans: "Все тарифы",
        noPlan: "Без подписки",
        sortBy: "Сортировка",
        sortNewest: "Сначала новые",
        sortOldest: "Сначала старые",
        sortTasksDesc: "Больше решенных задач",
        sortEmailAsc: "По Email (A-Z)",
        sortNameAsc: "По имени (A-Z)",
        viewTable: "Таблица",
        viewCards: "Карточки",
        colUser: "Пользователь",
        colRole: "Роль в системе",
        colPlan: "Тариф / Подписка",
        colProgress: "Прогресс задач",
        colRegistered: "Регистрация",
        colStatus: "Статус",
        colActions: "Действия",
        statusActive: "Активен",
        statusBlocked: "Заблокирован",
        roleAdmin: "Админ",
        roleUser: "Студент",
        makeAdmin: "Сделать админом",
        makeUser: "Снять права админа",
        blockUser: "Заблокировать",
        unblockUser: "Разблокировать",
        resetProgress: "Сбросить прогресс",
        deleteUser: "Удалить пользователя",
        viewDetails: "Профиль",
        exportCsv: "Экспорт CSV",
        confirmResetProgress: "Вы уверены, что хотите сбросить весь прогресс этого пользователя?",
        confirmDelete: "Вы уверены, что хотите безвозвратно удалить этого пользователя?",
        confirmRoleChange: (name: string, role: string) => `Изменить системную роль для ${name} на ${role}?`,
        tasksDone: "задач",
        ofTotal: "из",
        notFound: "Пользователи не найдены",
        notFoundDesc: "Попробуйте изменить поисковый запрос или фильтры",
        detailsTitle: "Профиль пользователя",
        close: "Закрыть",
        copyId: "Копировать ID",
        copied: "Скопировано!",
        contactInfo: "Контакты",
        phone: "Телефон",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        learningPath: "Направление",
        programmingLanguage: "Язык",
        notSpecified: "Не указано",
        page: "Страница",
        rowsPerPage: "Строк:",
        showing: "Показано",
        to: "—",
        of: "из",
        reviewSubmissions: "Проверить работы студента",
        passwordSecurity: "Пароль и безопасность",
        passwordSecurityDesc: "Сброс или установка нового пароля для пользователя",
        setNewPassword: "Установить пароль",
        sendResetLink: "Отправить ссылку",
        changePasswordModalTitle: "Смена пароля пользователя",
        newPasswordLabel: "Новый пароль",
        newPasswordPlaceholder: "Минимум 6 символов",
        generatePassword: "Сгенерировать",
        savePassword: "Сохранить пароль",
        cancel: "Отмена",
        passwordResetSuccess: "Пароль успешно обновлен!",
        resetLinkSentSuccess: "Ссылка для сброса отправлена на почту пользователя!",
        resetPasswordTooltip: "Сбросить / изменить пароль"
    },
    uk: {
        title: "Користувачі",
        subtitle: "Керування доступом, ролями та детальний прогрес студентів",
        searchPlaceholder: "Пошук за email, ім'ям, telegram...",
        totalUsers: "Всього користувачів",
        activeStudents: "Активні студенти",
        admins: "Адміністратори",
        withSubscription: "З підпискою",
        blocked: "Заблоковані",
        filterAll: "Всі",
        filterActive: "Активні",
        filterAdmins: "Адміни",
        filterSubscribed: "З підпискою",
        filterBlocked: "Заблоковані",
        allPlans: "Всі тарифи",
        noPlan: "Без підписки",
        sortBy: "Сортування",
        sortNewest: "Спочатку нові",
        sortOldest: "Спочатку старі",
        sortTasksDesc: "Більше вирішених завдань",
        sortEmailAsc: "За Email (A-Z)",
        sortNameAsc: "За ім'ям (A-Z)",
        viewTable: "Таблиця",
        viewCards: "Картки",
        colUser: "Користувач",
        colRole: "Роль у системі",
        colPlan: "Тариф / Підписка",
        colProgress: "Прогрес завдань",
        colRegistered: "Реєстрація",
        colStatus: "Статус",
        colActions: "Дії",
        statusActive: "Активний",
        statusBlocked: "Заблокований",
        roleAdmin: "Адмін",
        roleUser: "Студент",
        makeAdmin: "Зробити адміном",
        makeUser: "Зняти права адміна",
        blockUser: "Заблокувати",
        unblockUser: "Розблокувати",
        resetProgress: "Скинути прогрес",
        deleteUser: "Видалити користувача",
        viewDetails: "Профіль",
        exportCsv: "Експорт CSV",
        confirmResetProgress: "Ви впевнені, що хочете скинути весь прогрес цього користувача?",
        confirmDelete: "Ви впевнені, що хочете безповоротно видалити цього користувача?",
        confirmRoleChange: (name: string, role: string) => `Змінити системну роль для ${name} на ${role}?`,
        tasksDone: "завдань",
        ofTotal: "з",
        notFound: "Користувачів не знайдено",
        notFoundDesc: "Спробуйте змінити пошуковий запит або фільтри",
        detailsTitle: "Профіль користувача",
        close: "Закрити",
        copyId: "Копіювати ID",
        copied: "Скопійовано!",
        contactInfo: "Контакти",
        phone: "Телефон",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        learningPath: "Напрямок",
        programmingLanguage: "Мова",
        notSpecified: "Не вказано",
        page: "Сторінка",
        rowsPerPage: "Рядків:",
        showing: "Показано",
        to: "—",
        of: "з",
        reviewSubmissions: "Перевірити роботи студента",
        passwordSecurity: "Пароль та безпека",
        passwordSecurityDesc: "Скидання або встановлення нового пароля для користувача",
        setNewPassword: "Встановити пароль",
        sendResetLink: "Надіслати посилання",
        changePasswordModalTitle: "Зміна пароля користувача",
        newPasswordLabel: "Новий пароль",
        newPasswordPlaceholder: "Мінімум 6 символів",
        generatePassword: "Згенерувати",
        savePassword: "Зберегти пароль",
        cancel: "Скасувати",
        passwordResetSuccess: "Пароль успішно оновлено!",
        resetLinkSentSuccess: "Посилання для скидання надіслано на пошту користувача!",
        resetPasswordTooltip: "Скинути / змінити пароль"
    },
    en: {
        title: "Users Management",
        subtitle: "Manage access, roles, and monitor student learning progress",
        searchPlaceholder: "Search by email, name, telegram...",
        totalUsers: "Total Users",
        activeStudents: "Active Students",
        admins: "Administrators",
        withSubscription: "With Subscription",
        blocked: "Blocked Users",
        filterAll: "All",
        filterActive: "Active",
        filterAdmins: "Admins",
        filterSubscribed: "Subscribed",
        filterBlocked: "Blocked",
        allPlans: "All Plans",
        noPlan: "No Subscription",
        sortBy: "Sort by",
        sortNewest: "Newest first",
        sortOldest: "Oldest first",
        sortTasksDesc: "Most tasks completed",
        sortEmailAsc: "Email (A-Z)",
        sortNameAsc: "Name (A-Z)",
        viewTable: "Table",
        viewCards: "Cards",
        colUser: "User",
        colRole: "System Role",
        colPlan: "Plan / Role",
        colProgress: "Task Progress",
        colRegistered: "Registered",
        colStatus: "Status",
        colActions: "Actions",
        statusActive: "Active",
        statusBlocked: "Blocked",
        roleAdmin: "Admin",
        roleUser: "Student",
        makeAdmin: "Promote to Admin",
        makeUser: "Demote to Student",
        blockUser: "Block User",
        unblockUser: "Unblock User",
        resetProgress: "Reset Progress",
        deleteUser: "Delete User",
        viewDetails: "Details",
        exportCsv: "Export CSV",
        confirmResetProgress: "Are you sure you want to reset all progress for this user?",
        confirmDelete: "Are you sure you want to permanently delete this user?",
        confirmRoleChange: (name: string, role: string) => `Change system role for ${name} to ${role}?`,
        tasksDone: "tasks",
        ofTotal: "of",
        notFound: "No users found",
        notFoundDesc: "Try adjusting your search query or filters",
        detailsTitle: "User Details",
        close: "Close",
        copyId: "Copy ID",
        copied: "Copied!",
        contactInfo: "Contacts",
        phone: "Phone",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        learningPath: "Track",
        programmingLanguage: "Language",
        notSpecified: "Not specified",
        page: "Page",
        rowsPerPage: "Rows:",
        showing: "Showing",
        to: "to",
        of: "of",
        reviewSubmissions: "Review Submissions",
        passwordSecurity: "Password & Security",
        passwordSecurityDesc: "Reset or set a new password for this user",
        setNewPassword: "Set Password",
        sendResetLink: "Send Reset Link",
        changePasswordModalTitle: "Change User Password",
        newPasswordLabel: "New Password",
        newPasswordPlaceholder: "Minimum 6 characters",
        generatePassword: "Generate",
        savePassword: "Save Password",
        cancel: "Cancel",
        passwordResetSuccess: "Password successfully updated!",
        resetLinkSentSuccess: "Reset link sent to user's email!",
        resetPasswordTooltip: "Reset / change password"
    }
}

export default function UsersClient({ initialUsers, roles, totalTasks }: UsersClientProps) {
    const locale = useLocale()
    const t = translations[locale as "ru" | "uk" | "en"] || translations.ru

    const [users, setUsers] = useState<UserData[]>(initialUsers)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "admin" | "subscribed" | "blocked">("all")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "tasks" | "email" | "name">("newest")
    const [viewMode, setViewMode] = useState<"table" | "cards">("table")
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Password Reset Modal states
    const [passwordModalUser, setPasswordModalUser] = useState<UserData | null>(null)
    const [adminNewPassword, setAdminNewPassword] = useState("")
    const [showAdminPassword, setShowAdminPassword] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)

    const generateRandomPassword = () => {
        const letters = "abcdefghjkmnpqrstuvwxyz"
        const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const numbers = "23456789"
        const specials = "!@#$%^&*"
        let pwd = ""
        pwd += upper.charAt(Math.floor(Math.random() * upper.length))
        for (let i = 0; i < 5; i++) pwd += letters.charAt(Math.floor(Math.random() * letters.length))
        for (let i = 0; i < 2; i++) pwd += numbers.charAt(Math.floor(Math.random() * numbers.length))
        pwd += specials.charAt(Math.floor(Math.random() * specials.length))
        setAdminNewPassword(pwd)
    }

    const openPasswordModal = (user: UserData) => {
        setPasswordModalUser(user)
        setAdminNewPassword("")
        setShowAdminPassword(false)
    }

    const handleAdminSetPassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!passwordModalUser || !adminNewPassword.trim()) {
            toast.error("Введіть новий пароль")
            return
        }

        if (adminNewPassword.length < 6) {
            toast.error("Пароль має містити мінімум 6 символів")
            return
        }

        setIsSavingPassword(true)
        try {
            const res = await fetch("/api/admin/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: passwordModalUser.id,
                    newPassword: adminNewPassword.trim()
                })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success(t.passwordResetSuccess)
                setPasswordModalUser(null)
                setAdminNewPassword("")
            } else {
                toast.error(data.error || "Помилка при збереженні пароля")
            }
        } catch {
            toast.error("Помилка мережі")
        } finally {
            setIsSavingPassword(false)
        }
    }

    const handleSendResetEmail = async (user: UserData) => {
        if (!user.email) {
            toast.error("У користувача відсутній email")
            return
        }

        setIsSendingResetEmail(true)
        try {
            const res = await fetch("/api/admin/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    sendResetEmail: true,
                    locale
                })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success(t.resetLinkSentSuccess)
            } else {
                toast.error(data.error || "Помилка при надсиланні посилання")
            }
        } catch {
            toast.error("Помилка мережі")
        } finally {
            setIsSendingResetEmail(false)
        }
    }

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    const router = useRouter()

    const maxTasks = totalTasks > 0 ? totalTasks : 30

    // KPI Metrics
    const kpi = useMemo(() => {
        const total = users.length
        const active = users.filter(u => u.passedTasks > 0).length
        const admins = users.filter(u => u.role === "admin").length
        const subscribed = users.filter(u => u.dynamicRoleId !== null).length
        const blocked = users.filter(u => u.isBlocked).length
        return { total, active, admins, subscribed, blocked }
    }, [users])

    // Filter and Sort
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search
            const q = searchTerm.toLowerCase().trim()
            if (q) {
                const emailMatch = user.email?.toLowerCase().includes(q)
                const nameMatch = user.name?.toLowerCase().includes(q) ||
                    user.firstName?.toLowerCase().includes(q) ||
                    user.lastName?.toLowerCase().includes(q)
                const telegramMatch = user.telegram?.toLowerCase().includes(q)
                const phoneMatch = user.phone?.includes(q)
                if (!emailMatch && !nameMatch && !telegramMatch && !phoneMatch) {
                    return false
                }
            }

            // Status filter
            if (statusFilter === "active" && user.passedTasks === 0) return false
            if (statusFilter === "admin" && user.role !== "admin") return false
            if (statusFilter === "subscribed" && user.dynamicRoleId === null) return false
            if (statusFilter === "blocked" && !user.isBlocked) return false

            // Role / Plan filter
            if (roleFilter === "none" && user.dynamicRoleId !== null) return false
            if (roleFilter !== "all" && roleFilter !== "none") {
                if (user.dynamicRoleId !== Number(roleFilter)) return false
            }

            return true
        }).sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            }
            if (sortBy === "oldest") {
                return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            }
            if (sortBy === "tasks") {
                return b.passedTasks - a.passedTasks
            }
            if (sortBy === "email") {
                return (a.email || "").localeCompare(b.email || "")
            }
            if (sortBy === "name") {
                const nameA = a.name || a.firstName || a.email || ""
                const nameB = b.name || b.firstName || b.email || ""
                return nameA.localeCompare(nameB)
            }
            return 0
        })
    }, [users, searchTerm, statusFilter, roleFilter, sortBy])

    // Paginated Users
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredUsers.slice(start, start + pageSize)
    }, [filteredUsers, currentPage, pageSize])

    const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.success(t.copied)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const toggleBlock = async (user: UserData) => {
        const newStatus = !user.isBlocked
        setIsUpdating(prev => ({ ...prev, [user.id]: true }))
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, isBlocked: newStatus })
            })
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: newStatus } : u))
                if (selectedUser?.id === user.id) {
                    setSelectedUser(prev => prev ? { ...prev, isBlocked: newStatus } : null)
                }
                toast.success(newStatus ? t.statusBlocked : t.statusActive)
            } else {
                toast.error("Error updating status")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsUpdating(prev => ({ ...prev, [user.id]: false }))
        }
    }

    const toggleSystemRole = async (user: UserData) => {
        const targetRole = user.role === "admin" ? "user" : "admin"
        const targetRoleLabel = targetRole === "admin" ? t.roleAdmin : t.roleUser
        const userName = user.name || user.firstName || user.email || "User"

        if (!confirm(t.confirmRoleChange(userName, targetRoleLabel))) return

        setIsUpdating(prev => ({ ...prev, [user.id]: true }))
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, role: targetRole })
            })
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: targetRole } : u))
                if (selectedUser?.id === user.id) {
                    setSelectedUser(prev => prev ? { ...prev, role: targetRole } : null)
                }
                toast.success(`Role updated: ${targetRoleLabel}`)
            } else {
                toast.error("Error updating role")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsUpdating(prev => ({ ...prev, [user.id]: false }))
        }
    }

    const updateUserPlan = async (userId: string, roleIdStr: string) => {
        const dynamicRoleId = roleIdStr === "none" ? null : parseInt(roleIdStr)
        setIsUpdating(prev => ({ ...prev, [userId]: true }))
        try {
            const res = await fetch("/api/admin/users/role", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, dynamicRoleId })
            })
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, dynamicRoleId } : u))
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => prev ? { ...prev, dynamicRoleId } : null)
                }
                const roleName = roles.find(r => r.id === dynamicRoleId)?.name || t.noPlan
                toast.success(`${t.colPlan}: ${roleName}`)
            } else {
                toast.error("Error updating plan")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsUpdating(prev => ({ ...prev, [userId]: false }))
        }
    }

    const resetProgress = async (userId: string) => {
        if (!confirm(t.confirmResetProgress)) return

        setIsUpdating(prev => ({ ...prev, [userId]: true }))
        try {
            const res = await fetch("/api/admin/users/reset-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, passedTasks: 0 } : u))
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => prev ? { ...prev, passedTasks: 0 } : null)
                }
                toast.success(t.resetProgress)
            } else {
                toast.error("Error resetting progress")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsUpdating(prev => ({ ...prev, [userId]: false }))
        }
    }

    const deleteUser = async (id: string) => {
        if (!confirm(t.confirmDelete)) return

        setIsUpdating(prev => ({ ...prev, [id]: true }))
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id))
                if (selectedUser?.id === id) setSelectedUser(null)
                toast.success("User deleted")
            } else {
                toast.error("Error deleting user")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsUpdating(prev => ({ ...prev, [id]: false }))
        }
    }

    const exportCsv = () => {
        const headers = ["ID", "Email", "Name", "Phone", "Telegram", "Role", "Plan", "Tasks Done", "Blocked", "Registered"]
        const rows = filteredUsers.map(u => {
            const planName = roles.find(r => r.id === u.dynamicRoleId)?.name || "No plan"
            return [
                u.id,
                u.email || "",
                `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "",
                u.phone || "",
                u.telegram || "",
                u.role || "user",
                planName,
                u.passedTasks,
                u.isBlocked ? "Yes" : "No",
                u.createdAt ? new Date(u.createdAt).toISOString() : ""
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
        })

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(t.exportCsv)
    }

    const getDisplayName = (user: UserData) => {
        const full = `${user.firstName || ""} ${user.lastName || ""}`.trim()
        if (full) return full
        if (user.name) return user.name
        if (user.email) return user.email.split("@")[0]
        return "Student"
    }

    const getRoleName = (dynamicRoleId: number | null) => {
        if (!dynamicRoleId) return t.noPlan
        return roles.find(r => r.id === dynamicRoleId)?.name || t.noPlan
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        {t.title}
                        <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {users.length}
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCsv}
                        className="px-4 py-2.5 bg-card hover:bg-secondary/70 border border-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-2 shadow-sm hover:border-blue-500/30"
                    >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        {t.exportCsv}
                    </button>
                    <div className="flex bg-card border border-border rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-muted-foreground hover:text-foreground"}`}
                            title={t.viewTable}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("cards")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "cards" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-muted-foreground hover:text-foreground"}`}
                            title={t.viewCards}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div
                    onClick={() => { setStatusFilter("all"); setRoleFilter("all"); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === "all" && roleFilter === "all" ? "bg-blue-500/10 border-blue-500/30 shadow-md shadow-blue-500/10" : "bg-card border-border/70 hover:border-border"}`}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{t.totalUsers}</span>
                        <UserIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">{kpi.total}</div>
                </div>

                <div
                    onClick={() => setStatusFilter("active")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === "active" ? "bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/10" : "bg-card border-border/70 hover:border-border"}`}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{t.activeStudents}</span>
                        <Award className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground flex items-baseline gap-2">
                        {kpi.active}
                        <span className="text-xs font-semibold text-emerald-500">
                            {kpi.total > 0 ? Math.round((kpi.active / kpi.total) * 100) : 0}%
                        </span>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter("admin")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === "admin" ? "bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/10" : "bg-card border-border/70 hover:border-border"}`}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{t.admins}</span>
                        <Crown className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">{kpi.admins}</div>
                </div>

                <div
                    onClick={() => setStatusFilter("subscribed")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === "subscribed" ? "bg-purple-500/10 border-purple-500/30 shadow-md shadow-purple-500/10" : "bg-card border-border/70 hover:border-border"}`}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{t.withSubscription}</span>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">{kpi.subscribed}</div>
                </div>

                <div
                    onClick={() => setStatusFilter("blocked")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 md:col-span-1 ${statusFilter === "blocked" ? "bg-rose-500/10 border-rose-500/30 shadow-md shadow-rose-500/10" : "bg-card border-border/70 hover:border-border"}`}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{t.blocked}</span>
                        <ShieldOff className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">{kpi.blocked}</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-9 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter by Plan */}
                    <div className="w-full sm:w-56">
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                        >
                            <option value="all">{t.allPlans}</option>
                            <option value="none">{t.noPlan}</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="w-full sm:w-56">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                        >
                            <option value="newest">{t.sortNewest}</option>
                            <option value="oldest">{t.sortOldest}</option>
                            <option value="tasks">{t.sortTasksDesc}</option>
                            <option value="email">{t.sortEmailAsc}</option>
                            <option value="name">{t.sortNameAsc}</option>
                        </select>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                        <Filter className="w-3 h-3 inline mr-1" />
                        Фильтр:
                    </span>
                    {(["all", "active", "admin", "subscribed", "blocked"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === f ? "bg-blue-600 text-white shadow-sm" : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground"}`}
                        >
                            {f === "all" && t.filterAll}
                            {f === "active" && t.filterActive}
                            {f === "admin" && t.filterAdmins}
                            {f === "subscribed" && t.filterSubscribed}
                            {f === "blocked" && t.filterBlocked}
                        </button>
                    ))}
                    {(searchTerm || statusFilter !== "all" || roleFilter !== "all") && (
                        <button
                            onClick={() => { setSearchTerm(""); setStatusFilter("all"); setRoleFilter("all"); setCurrentPage(1); }}
                            className="text-xs text-blue-500 hover:underline font-bold ml-auto"
                        >
                            Сбросить фильтры
                        </button>
                    )}
                </div>
            </div>

            {/* Results Count & Current Slice */}
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span>
                    {t.showing} {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} {t.to} {Math.min(currentPage * pageSize, filteredUsers.length)} {t.of} {filteredUsers.length}
                </span>
                <div className="flex items-center gap-2">
                    <span>{t.rowsPerPage}</span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-card border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {filteredUsers.length === 0 ? (
                <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm">
                    <UserIcon className="mx-auto w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-base font-bold text-foreground mb-1">{t.notFound}</h3>
                    <p className="text-xs text-muted-foreground">{t.notFoundDesc}</p>
                </div>
            ) : viewMode === "table" ? (
                /* ─── DATA TABLE VIEW ─── */
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-secondary/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-4">{t.colUser}</th>
                                    <th className="py-3.5 px-4">{t.colRole}</th>
                                    <th className="py-3.5 px-4">{t.colPlan}</th>
                                    <th className="py-3.5 px-4">{t.colProgress}</th>
                                    <th className="py-3.5 px-4">{t.colRegistered}</th>
                                    <th className="py-3.5 px-4">{t.colStatus}</th>
                                    <th className="py-3.5 px-4 text-right">{t.colActions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {paginatedUsers.map((user) => {
                                    const displayName = getDisplayName(user)
                                    const progressPercent = Math.min(Math.round((user.passedTasks / maxTasks) * 100), 100)
                                    const isRowUpdating = isUpdating[user.id]

                                    return (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-secondary/20 transition-colors group cursor-pointer ${user.isBlocked ? "bg-rose-500/[0.02]" : ""}`}
                                            onClick={(e) => {
                                                // Don't open drawer if clicked interactive elements
                                                const target = e.target as HTMLElement
                                                if (target.closest("button") || target.closest("select") || target.closest("a")) return
                                                setSelectedUser(user)
                                            }}
                                        >
                                            {/* User Info */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${user.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                                                        {user.image ? (
                                                            <img src={user.image} alt={displayName} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            (user.firstName?.[0] || user.name?.[0] || user.email?.[0] || "U").toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-foreground text-sm truncate max-w-[200px]" title={displayName}>
                                                                {displayName}
                                                            </span>
                                                            {user.role === "admin" && (
                                                                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                            <span className="font-mono truncate max-w-[220px]" title={user.email || ""}>
                                                                {user.email || "No email"}
                                                            </span>
                                                            {user.email && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(user.email!, user.id); }}
                                                                    className="text-muted-foreground/40 hover:text-foreground transition-colors p-0.5"
                                                                    title="Copy email"
                                                                >
                                                                    {copiedId === user.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {user.telegram && (
                                                            <span className="inline-block text-[10px] text-blue-500 font-bold mt-0.5">
                                                                @{user.telegram.replace("@", "")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* System Role */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSystemRole(user); }}
                                                    disabled={isRowUpdating}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${user.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border"}`}
                                                    title={user.role === "admin" ? t.makeUser : t.makeAdmin}
                                                >
                                                    {user.role === "admin" ? (
                                                        <>
                                                            <Crown className="w-3 h-3 text-amber-500" />
                                                            {t.roleAdmin}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserIcon className="w-3 h-3" />
                                                            {t.roleUser}
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Plan / Dynamic Role */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <select
                                                    value={user.dynamicRoleId || "none"}
                                                    onChange={(e) => { e.stopPropagation(); updateUserPlan(user.id, e.target.value); }}
                                                    disabled={isRowUpdating}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${user.dynamicRoleId ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-secondary/40 text-muted-foreground border-border hover:border-border"}`}
                                                >
                                                    <option value="none">{t.noPlan}</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Progress */}
                                            <td className="py-4 px-4 min-w-[160px]">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-foreground">
                                                            {user.passedTasks} <span className="text-muted-foreground font-medium text-[11px]">/ {maxTasks}</span>
                                                        </span>
                                                        <span className="text-[11px] font-black text-blue-500">{progressPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Registered Date */}
                                            <td className="py-4 px-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === "ru" ? "ru-RU" : locale === "uk" ? "uk-UA" : "en-US") : "—"}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleBlock(user); }}
                                                    disabled={isRowUpdating}
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${user.isBlocked ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"}`}
                                                    title={user.isBlocked ? t.unblockUser : t.blockUser}
                                                >
                                                    {user.isBlocked ? (
                                                        <>
                                                            <Lock className="w-3 h-3" />
                                                            {t.statusBlocked}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {t.statusActive}
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                                        title={t.viewDetails}
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openPasswordModal(user)}
                                                        disabled={isRowUpdating}
                                                        className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                                                        title={t.resetPasswordTooltip}
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => resetProgress(user.id)}
                                                        disabled={isRowUpdating}
                                                        className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                                                        title={t.resetProgress}
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBlock(user)}
                                                        disabled={isRowUpdating}
                                                        className={`p-2 rounded-xl transition-all ${user.isBlocked ? "text-rose-500 hover:bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"}`}
                                                        title={user.isBlocked ? t.unblockUser : t.blockUser}
                                                    >
                                                        {user.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        disabled={isRowUpdating}
                                                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        title={t.deleteUser}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ─── CARDS GRID VIEW ─── */
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedUsers.map((user) => {
                        const displayName = getDisplayName(user)
                        const progressPercent = Math.min(Math.round((user.passedTasks / maxTasks) * 100), 100)
                        const isRowUpdating = isUpdating[user.id]

                        return (
                            <div
                                key={user.id}
                                className={`bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all flex flex-col justify-between cursor-pointer ${user.isBlocked ? "opacity-75 grayscale" : ""}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div>
                                    {/* Card Top: Avatar, Name, Email, Role */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${user.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                                                {user.image ? (
                                                    <img src={user.image} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    (user.firstName?.[0] || user.name?.[0] || user.email?.[0] || "U").toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="font-bold text-foreground text-sm truncate" title={displayName}>
                                                        {displayName}
                                                    </h3>
                                                    {user.role === "admin" && (
                                                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono truncate mt-0.5" title={user.email || ""}>
                                                    {user.email || "No email"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => openPasswordModal(user)}
                                                className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                                title={t.resetPasswordTooltip}
                                            >
                                                <KeyRound className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleBlock(user)}
                                                className={`p-1.5 rounded-lg transition-all ${user.isBlocked ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"}`}
                                                title={user.isBlocked ? t.unblockUser : t.blockUser}
                                            >
                                                {user.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all"
                                                title={t.deleteUser}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Selector */}
                                    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                                        <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-wider">
                                            {t.colPlan}
                                        </label>
                                        <select
                                            value={user.dynamicRoleId || "none"}
                                            onChange={(e) => updateUserPlan(user.id, e.target.value)}
                                            disabled={isRowUpdating}
                                            className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="none">{t.noPlan}</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-muted-foreground uppercase text-[10px] tracking-wider">{t.colProgress}</span>
                                            <span className="text-blue-500">{user.passedTasks} / {maxTasks} ({progressPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Bottom Details */}
                                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Calendar className="w-3 h-3 opacity-50" />
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSystemRole(user); }}
                                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${user.role === "admin" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {user.role === "admin" ? t.roleAdmin : t.roleUser}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-3 shadow-sm">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-all flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Предыдущая
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum = i + 1
                            if (totalPages > 7) {
                                if (currentPage > 4) pageNum = currentPage - 3 + i
                                if (pageNum > totalPages) pageNum = totalPages - 6 + i
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === pageNum ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-all flex items-center gap-1"
                    >
                        Следующая
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ─── SLIDE-OVER USER DETAILS DRAWER ─── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                    <div
                        className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10">
                            <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-blue-500" />
                                {t.detailsTitle}
                            </h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="p-6 space-y-6 flex-1">
                            {/* Profile Card */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${selectedUser.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                                    {selectedUser.image ? (
                                        <img src={selectedUser.image} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        (selectedUser.firstName?.[0] || selectedUser.name?.[0] || selectedUser.email?.[0] || "U").toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-foreground text-base truncate">
                                            {getDisplayName(selectedUser)}
                                        </h3>
                                        {selectedUser.role === "admin" && (
                                            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono truncate">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedUser.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                                            {selectedUser.role === "admin" ? t.roleAdmin : t.roleUser}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedUser.isBlocked ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                            {selectedUser.isBlocked ? t.statusBlocked : t.statusActive}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User ID */}
                            <div className="p-3 rounded-xl bg-secondary/20 border border-border flex items-center justify-between text-xs">
                                <span className="font-mono text-muted-foreground truncate max-w-[280px]">
                                    ID: {selectedUser.id}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(selectedUser.id, `drawer-${selectedUser.id}`)}
                                    className="text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 text-[11px]"
                                >
                                    {copiedId === `drawer-${selectedUser.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {t.copyId}
                                </button>
                            </div>

                            {/* Learning Progress */}
                            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-blue-500" />
                                        {t.colProgress}
                                    </span>
                                    <span className="text-xs font-black text-blue-500">
                                        {selectedUser.passedTasks} / {maxTasks} ({Math.min(Math.round((selectedUser.passedTasks / maxTasks) * 100), 100)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(Math.round((selectedUser.passedTasks / maxTasks) * 100), 100)}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">{t.learningPath}</span>
                                        <span className="font-bold text-foreground capitalize mt-0.5 block">
                                            {selectedUser.learningPath || t.notSpecified}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">{t.programmingLanguage}</span>
                                        <span className="font-bold text-foreground capitalize mt-0.5 block">
                                            {selectedUser.programmingLanguage || "TypeScript"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Plan & System Role Setting */}
                            <div className="space-y-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                                    Настройка доступа и ролей
                                </span>

                                <div>
                                    <label className="text-[11px] font-bold text-foreground block mb-1.5">
                                        {t.colPlan}
                                    </label>
                                    <select
                                        value={selectedUser.dynamicRoleId || "none"}
                                        onChange={(e) => updateUserPlan(selectedUser.id, e.target.value)}
                                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="none">{t.noPlan}</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div>
                                        <p className="text-xs font-bold text-foreground">{t.colRole}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {selectedUser.role === "admin" ? "Полный доступ к панели управления" : "Обычный аккаунт студента"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleSystemRole(selectedUser)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedUser.role === "admin" ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20" : "bg-blue-600 text-white hover:bg-blue-500 shadow-sm"}`}
                                    >
                                        {selectedUser.role === "admin" ? t.makeUser : t.makeAdmin}
                                    </button>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                                    {t.contactInfo}
                                </span>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                                            Email:
                                        </span>
                                        <span className="font-mono font-medium text-foreground">{selectedUser.email || "—"}</span>
                                    </div>

                                    {selectedUser.telegram && (
                                        <div className="flex items-center justify-between py-1 border-b border-border/40">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Send className="w-3.5 h-3.5 text-blue-400" />
                                                Telegram:
                                            </span>
                                            <a
                                                href={`https://t.me/${selectedUser.telegram.replace("@", "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline font-bold flex items-center gap-1"
                                            >
                                                @{selectedUser.telegram.replace("@", "")}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}

                                    {selectedUser.phone && (
                                        <div className="flex items-center justify-between py-1 border-b border-border/40">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                                {t.phone}:
                                            </span>
                                            <a href={`tel:${selectedUser.phone}`} className="text-foreground hover:text-blue-500 font-mono">
                                                {selectedUser.phone}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                                            {t.colRegistered}:
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Password & Security Card */}
                            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <KeyRound className="w-4 h-4 text-amber-500" />
                                        {t.passwordSecurity}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t.passwordSecurityDesc}
                                </p>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        onClick={() => openPasswordModal(selectedUser)}
                                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        {t.setNewPassword}
                                    </button>
                                    <button
                                        onClick={() => handleSendResetEmail(selectedUser)}
                                        disabled={isSendingResetEmail}
                                        className="py-2.5 px-3 rounded-xl border border-border hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                                        {t.sendResetLink}
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="space-y-2 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                                <span className="text-xs font-black uppercase tracking-wider text-rose-500 block">
                                    Опасная зона
                                </span>
                                <div className="space-y-2 pt-1">
                                    <button
                                        onClick={() => resetProgress(selectedUser.id)}
                                        className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-amber-500/10 text-amber-500 font-bold text-xs transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                        {t.resetProgress}
                                    </button>

                                    <button
                                        onClick={() => toggleBlock(selectedUser)}
                                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${selectedUser.isBlocked ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"}`}
                                    >
                                        {selectedUser.isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                        {selectedUser.isBlocked ? t.unblockUser : t.blockUser}
                                    </button>

                                    <button
                                        onClick={() => deleteUser(selectedUser.id)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {t.deleteUser}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ADMIN PASSWORD RESET MODAL ─── */}
            {passwordModalUser && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.changePasswordModalTitle}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{passwordModalUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPasswordModalUser(null)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAdminSetPassword} className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground">
                                        {t.newPasswordLabel}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3" />
                                        {t.generatePassword}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showAdminPassword ? "text" : "password"}
                                        value={adminNewPassword}
                                        onChange={(e) => setAdminNewPassword(e.target.value)}
                                        placeholder={t.newPasswordPlaceholder}
                                        required
                                        className="w-full h-11 bg-secondary/50 border border-border rounded-xl px-3.5 pr-10 text-xs font-mono font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalUser(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword || !adminNewPassword.trim()}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                >
                                    {isSavingPassword ? "..." : t.savePassword}
                                </button>
                            </div>
                        </form>

                        <div className="pt-3 border-t border-border/50 text-center">
                            <button
                                type="button"
                                onClick={() => handleSendResetEmail(passwordModalUser)}
                                disabled={isSendingResetEmail}
                                className="text-xs text-blue-500 hover:underline font-semibold inline-flex items-center gap-1.5"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                {t.sendResetLink}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
