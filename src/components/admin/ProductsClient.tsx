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
                grantedRoleId: product.grantedRoleId?.toString() || "none",
                isActive: product.isActive ?? true
            })
        } else {
            setEditingProduct(null)
            setFormData({
                title: "",
                description: "",
                price: "",
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
            price: formData.price // API handles conversion to cents
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
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        Товари та підписки
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
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
                    <div key={product.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md ${!product.isActive ? 'opacity-75 grayscale' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{product.title}</h3>
                                    <p className="text-xs font-black text-blue-600">{(product.price / 100).toFixed(2)} USD</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openModal(product)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                            {product.description || "Опис відсутній"}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Надає роль</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">
                                    {roles.find(r => r.id === product.grantedRoleId)?.name || "Не призначено"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-3">
                                <span className="text-xs font-bold text-gray-400 uppercase">Статус</span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {product.isActive ? 'Активний' : 'Вимкнено'}
                                </span>
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
                                {editingProduct ? "Редагувати товар" : "Новий товар"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Назва товару</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Наприклад: Підписка Gold (1 міс)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Опис</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-20"
                                    placeholder="Що входить у цей товар..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Ціна (USD)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Роль, що надається</label>
                                <select
                                    value={formData.grantedRoleId}
                                    onChange={(e) => setFormData({ ...formData, grantedRoleId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                    className={`w-11 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-blue-600" : "bg-gray-200"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`} />
                                </button>
                                <span className="text-sm font-bold text-gray-700">Активний для продажу</span>
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
