"use client"

import { useState, useEffect } from "react"
import { Key, Plus, Trash2, Shield, Calendar, Users, Ban, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface AccessCode {
    id: number
    code: string
    productId: number
    maxUses: number
    usedCount: number
    expiresAt: string | null
    isActive: boolean
    createdAt: string
    productTitle: string | null
    productType: string | null
    grantedRoleName: string | null
}

interface Product {
    id: number
    title: string
    type: string
}

export default function AccessCodesClient({ products }: { products: Product[] }) {
    const [codes, setCodes] = useState<AccessCode[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        productId: "",
        maxUses: "1",
        customCode: ""
    })

    useEffect(() => {
        fetchCodes()
    }, [])

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/admin/access-codes")
            const data = await res.json()
            setCodes(data)
        } catch (error) {
            toast.error("Не вдалося завантажити коди доступу")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let reqData: any = {
                productId: formData.productId,
                maxUses: formData.maxUses,
            }

            // Only generate custom string if user typed something
            const randomCode = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let result = '';
                for (let i = 0; i < 12; i++) {
                    if (i > 0 && i % 4 === 0) result += '-';
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            }

            reqData.customCode = formData.customCode.trim() ? formData.customCode : randomCode()

            const res = await fetch("/api/admin/access-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Код доступу створено!")
                setIsModalOpen(false)
                setFormData({ productId: "", maxUses: "1", customCode: "" })
                fetchCodes()
            } else {
                toast.error(data.error || "Помилка при створенні")
            }
        } catch (error) {
            toast.error("Помилка при створенні")
        }
    }

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/admin/access-codes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !currentStatus })
            })

            if (res.ok) {
                setCodes(codes.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c))
                toast.success("Статус оновлено")
            }
        } catch (error) {
            toast.error("Помилка при оновленні статусу")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Дійсно видалити цей промо-код? Всі, хто його активував, НЕ втратять доступ, але код більше не працюватиме.")) return

        try {
            const res = await fetch(`/api/admin/access-codes?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setCodes(codes.filter(c => c.id !== id))
                toast.success("Код видалено")
            }
        } catch (error) {
            toast.error("Помилка при видаленні")
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Завантаження...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Key className="w-6 h-6 text-indigo-600" />
                        Коди Доступу (Промокоди)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Генеруйте інвайти для B2B команд, подарункові підписки або B2C продажі
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Згенерувати код
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-black tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Код</th>
                            <th className="px-6 py-4">Продукт</th>
                            <th className="px-6 py-4">Використання</th>
                            <th className="px-6 py-4">Дата Створення</th>
                            <th className="px-6 py-4">Статус</th>
                            <th className="px-6 py-4 text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {codes.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block border border-indigo-100 uppercase">
                                        {c.code}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{c.productTitle || "—"}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Shield className="w-3 h-3" />
                                        Надає: {c.grantedRoleName || "Немає"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="font-bold text-gray-900">{c.usedCount}</span>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-gray-500">{c.maxUses}</span>
                                    </div>
                                    {c.usedCount >= c.maxUses && (
                                        <span className="text-[10px] font-bold text-red-500 uppercase">Ліміт вичерпано</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(c.createdAt).toLocaleDateString("uk-UA")}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(c.id, c.isActive)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                            c.isActive
                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                    >
                                        {c.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                        {c.isActive ? 'Активний' : 'Вимкнений'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {codes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Ще немає жодного коду доступу. Згенеруйте перший!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Новий код доступу</h2>
                            <p className="text-sm text-gray-500 mt-1">Згенерувати ключ для активації продукту</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Товар / Продукт</label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Оберіть продукт...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} ({p.type === 'b2b' ? 'B2B' : p.type === 'subscription' ? 'Підписка' : 'B2C'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Кількість використань (Ліміт)</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="1 для B2C, 5+ для B2B"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-1.5 ml-1">Власний код (необов'язково)</label>
                                <input
                                    type="text"
                                    value={formData.customCode}
                                    onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                                    className="w-full px-4 py-3 font-mono uppercase bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Залиште пустим для авто-генерації"
                                />
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
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    Згенерувати
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
