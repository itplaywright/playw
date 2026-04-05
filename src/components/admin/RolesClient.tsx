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
    hasPracticeAccess: boolean | null
    hasAiReview: boolean | null
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
        hasPracticeAccess: false,
        hasAiReview: false,
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
                hasPracticeAccess: role.hasPracticeAccess || false,
                hasAiReview: role.hasAiReview || false,
                isDefault: role.isDefault || false
            })
        } else {
            setEditingRole(null)
            setFormData({
                name: "",
                description: "",
                maxTrackOrder: 0,
                hasPracticeAccess: false,
                hasAiReview: false,
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
                    <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Керування ролями
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
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
                    <div key={role.id} className="bg-card rounded-3xl p-6 shadow-md border border-border/60 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group">
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-2xl shadow-inner">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground tracking-tight">{role.name}</h3>
                                    {role.isDefault && (
                                        <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg tracking-widest mt-0.5 block w-fit">Default Role</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal(role)}
                                    className="p-2 text-muted-foreground/40 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="p-2 text-muted-foreground/40 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground mb-6 line-clamp-2 font-black uppercase tracking-widest leading-relaxed">
                            {role.description || "No description provided"}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 bg-secondary/50 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Tracks Access</span>
                                </div>
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Up to {role.maxTrackOrder}</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-secondary/50 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-3">
                                    {role.hasPracticeAccess ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-muted-foreground/30" />}
                                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Practice Access</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${role.hasPracticeAccess ? "text-emerald-500" : "text-muted-foreground/40"}`}>
                                    {role.hasPracticeAccess ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-secondary/50 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-3">
                                    {role.hasAiReview ? <Unlock className="w-4 h-4 text-purple-500" /> : <Lock className="w-4 h-4 text-muted-foreground/30" />}
                                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">AI Expert Review</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${role.hasAiReview ? "text-purple-600" : "text-muted-foreground/40"}`}>
                                    {role.hasAiReview ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-border">
                        <div className="px-8 py-8 border-b border-border flex items-center justify-between bg-secondary/30">
                            <h2 className="text-xl font-black text-foreground tracking-tight">
                                {editingRole ? "Editing Role" : "New Security Role"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-card border border-transparent hover:border-border rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground/50 mb-2 ml-1 tracking-widest">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-2xl text-foreground font-black text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Master Archer"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground/50 mb-2 ml-1 tracking-widest">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-2xl text-foreground font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                                    placeholder="What flags does this role enable?"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground/50 mb-2 ml-1 tracking-widest">Max Track Level Access</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.maxTrackOrder}
                                    onChange={(e) => setFormData({ ...formData, maxTrackOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-2xl text-foreground font-black text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <div 
                                    onClick={() => setFormData({ ...formData, hasPracticeAccess: !formData.hasPracticeAccess })}
                                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border cursor-pointer hover:bg-secondary transition-all"
                                >
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">Practice Projects Access</span>
                                    <div className={`w-11 h-6 rounded-full transition-all relative ${formData.hasPracticeAccess ? "bg-blue-600" : "bg-muted"}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.hasPracticeAccess ? "left-6" : "left-1"}`} />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setFormData({ ...formData, hasAiReview: !formData.hasAiReview })}
                                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border cursor-pointer hover:bg-secondary transition-all"
                                >
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">AI Expert Mentor Access</span>
                                    <div className={`w-11 h-6 rounded-full transition-all relative ${formData.hasAiReview ? "bg-purple-600" : "bg-muted"}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.hasAiReview ? "left-6" : "left-1"}`} />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border cursor-pointer hover:bg-secondary transition-all"
                                >
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">Set as Default Role</span>
                                    <div className={`w-11 h-6 rounded-full transition-all relative ${formData.isDefault ? "bg-blue-600" : "bg-muted"}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.isDefault ? "left-6" : "left-1"}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 bg-secondary text-foreground rounded-2xl font-black text-sm hover:bg-secondary/80 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    {editingRole ? "Update Securely" : "Create Security Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
