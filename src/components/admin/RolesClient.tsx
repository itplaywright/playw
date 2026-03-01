"use client"

import { useState } from "react"
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Lock,
    Unlock,
    Info
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Role {
    id: number
    name: string
    description: string | null
    maxTrackOrder: number | null
    isDefault: boolean | null
}

export default function RolesClient({ initialRoles }: { initialRoles: Role[] }) {
    const [roles, setRoles] = useState(initialRoles)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        maxTrackOrder: 0,
        isDefault: false
    })
    const router = useRouter()

    const openModal = (role: Role | null = null) => {
        if (role) {
            setEditingRole(role)
            setFormData({
                name: role.name,
                description: role.description || "",
                maxTrackOrder: role.maxTrackOrder || 0,
                isDefault: role.isDefault || false
            })
        } else {
            setEditingRole(null)
            setFormData({
                name: "",
                description: "",
                maxTrackOrder: 0,
                isDefault: false
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingRole ? "PATCH" : "POST"
        const payload = editingRole ? { ...formData, id: editingRole.id } : formData

        try {
            const res = await fetch("/api/admin/roles", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const updatedRole = await res.json()
                if (editingRole) {
                    setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r))
                    toast.success("Роль оновлено")
                } else {
                    setRoles([...roles, updatedRole])
                    toast.success("Роль створено")
                }
                setIsModalOpen(false)
                router.refresh()
            } else {
                const err = await res.json()
                toast.error(err.error || "Помилка при збереженні ролі")
            }
        } catch (error) {
            toast.error("Помилка при збереженні ролі")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Ви впевнені, що хочете видалити цю роль?")) return

        try {
            const res = await fetch(`/api/admin/roles?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setRoles(roles.filter(r => r.id !== id))
                toast.success("Роль видалено")
                router.refresh()
            } else {
                toast.error("Помилка при видаленні ролі")
            }
        } catch (error) {
            toast.error("Помилка при видаленні ролі")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Керування ролями
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Налаштуйте рівні доступу та підписки для користувачів
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Додати роль
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                                    {role.isDefault && (
                                        <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded">За замовчуванням</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openModal(role)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                            {role.description || "Опис відсутній"}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Доступ до треків</span>
                                </div>
                                <span className="text-sm font-black text-blue-600">До рівня {role.maxTrackOrder}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingRole ? "Редагувати роль" : "Нова роль"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Назва ролі</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Наприклад: Gold Покупець"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Опис</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                                    placeholder="Короткий опис можливостей цієї ролі..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Макс. рівень треку (Access)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.maxTrackOrder}
                                    onChange={(e) => setFormData({ ...formData, maxTrackOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 flex items-start gap-1">
                                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    Користувач зможе бачити тільки ті треки, у яких поле 'Order' менше або дорівнює цьому значенню.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                                    className={`w-11 h-6 rounded-full transition-all relative ${formData.isDefault ? "bg-blue-600" : "bg-gray-200"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isDefault ? "left-6" : "left-1"}`} />
                                </button>
                                <span className="text-sm font-bold text-gray-700">Встановити як роль за замовчуванням</span>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
