"use client"

import { useState } from "react"
import {
    ShoppingBag,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Eye,
    EyeOff,
    DollarSign,
    Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Product {
    id: number
    title: string
    description: string | null
    price: number
    currency: "USD" | "UAH" | "EUR"
    type: "course" | "b2c" | "subscription" | "b2b" | "disk" | "other"
    durationMonths: number | null
    grantedRoleId: number | null
    isActive: boolean | null
}

interface Role {
    id: number
    name: string
}

export default function ProductsClient({ initialProducts, roles }: { initialProducts: Product[], roles: Role[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        currency: "USD",
        type: "b2c",
        durationMonths: "1",
        grantedRoleId: "none",
        isActive: true
    })
    const router = useRouter()

    const openModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                title: product.title,
                description: product.description || "",
                price: (product.price / 100).toString(),
                currency: product.currency || "USD",
                type: product.type || "b2c",
                durationMonths: product.durationMonths?.toString() || "1",
                grantedRoleId: product.grantedRoleId?.toString() || "none",
                isActive: product.isActive ?? true
            })
        } else {
            setEditingProduct(null)
            setFormData({
                title: "",
                description: "",
                price: "",
                currency: "USD",
                type: "b2c",
                durationMonths: "1",
                grantedRoleId: "none",
                isActive: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingProduct ? "PATCH" : "POST"
        const payload = {
            ...formData,
            id: editingProduct?.id,
            grantedRoleId: formData.grantedRoleId === "none" ? null : parseInt(formData.grantedRoleId),
            price: formData.price, // API handles conversion to cents
            durationMonths: formData.type === "subscription" ? parseInt(formData.durationMonths) || 1 : null
        }

        try {
            const res = await fetch("/api/admin/products", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const updatedProduct = await res.json()
                if (editingProduct) {
                    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
                    toast.success("Товар оновлено")
                } else {
                    setProducts([...products, updatedProduct])
                    toast.success("Товар створено")
                }
                setIsModalOpen(false)
                router.refresh()
            } else {
                toast.error("Помилка при збереженні товару")
            }
        } catch (error) {
            toast.error("Помилка при збереженні товару")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id))
                toast.success("Товар видалено")
                router.refresh()
            } else {
                toast.error("Помилка при видаленні товару")
            }
        } catch (error) {
            toast.error("Помилка при видаленні товару")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        Товари та підписки
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                        Створюйте товари, які надають користувачам певні ролі та доступ
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Додати товар
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <div key={product.id} className={`bg-card rounded-3xl p-6 shadow-md border border-border/60 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group ${!product.isActive ? 'opacity-75 grayscale' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground tracking-tight">{product.title}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{(product.price / 100).toFixed(2)} {product.currency}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openModal(product)}
                                    className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 font-medium">
                            {product.description || "Опис відсутній"}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Тип</span>
                                </div>
                                <span className="text-sm font-black text-foreground">
                                    {product.type === "subscription" ? `Підписка (${product.durationMonths} міс)` :
                                     product.type === "b2b" ? "B2B Команда" : "B2C Довічно"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Надає роль</span>
                                </div>
                                <span className="text-sm font-black text-foreground">
                                    {roles.find(r => r.id === product.grantedRoleId)?.name || "Не призначено"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-3">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Статус</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${product.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                    {product.isActive ? 'Активний' : 'Вимкнено'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-border">
                        <div className="px-6 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
                            <h2 className="text-xl font-black text-foreground tracking-tight">
                                {editingProduct ? "Редагувати товар" : "Новий товар"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-card rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Назва товару</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-card border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-muted-foreground/30 text-sm"
                                    placeholder="Наприклад: Підписка Gold (1 міс)"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Опис</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-card border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-20 placeholder:text-muted-foreground/30 text-sm"
                                    placeholder="Що входить у цей товар..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Ціна</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-muted-foreground/30 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Валюта</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="UAH">UAH (₴)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Тип Товару</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                >
                                    <option value="b2c">B2C (Довічний доступ)</option>
                                    <option value="subscription">Підписка (Щомісячно)</option>
                                    <option value="b2b">B2B (Для команд)</option>
                                </select>
                            </div>
                            
                            {formData.type === "subscription" && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Тривалість (Місяців)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.durationMonths}
                                        onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                                        className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 ml-1">Роль, що надається</label>
                                <select
                                    value={formData.grantedRoleId}
                                    onChange={(e) => setFormData({ ...formData, grantedRoleId: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground font-black rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                >
                                    <option value="none">Не надає ролі</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`w-11 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-blue-600" : "bg-muted"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`} />
                                </button>
                                <span className="text-sm font-black text-foreground">Активний для продажу</span>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-secondary text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all"
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
