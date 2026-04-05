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
        return <div className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Завантаження...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <Key className="w-6 h-6 text-indigo-500" />
                        Коди Доступу
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-bold">
                        Генеруйте інвайти для B2B команд та промокоди
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Згенерувати ключ
                </button>
            </div>

            <div className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-md">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4 border-b border-border/50">Код</th>
                            <th className="px-6 py-4 border-b border-border/50">Продукт</th>
                            <th className="px-6 py-4 border-b border-border/50">Використання</th>
                            <th className="px-6 py-4 border-b border-border/50">Дата Створення</th>
                            <th className="px-6 py-4 border-b border-border/50">Статус</th>
                            <th className="px-6 py-4 text-right border-b border-border/50">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                        {codes.map((c) => (
                            <tr key={c.id} className="hover:bg-secondary/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono font-black text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-xl inline-block border border-indigo-500/10 uppercase tracking-wider">
                                        {c.code}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-black text-foreground tracking-tight">{c.productTitle || "—"}</div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 mt-1 opacity-70">
                                        <Shield className="w-3 h-3 text-indigo-500" />
                                        Надає: {c.grantedRoleName || "None"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground/50" />
                                        <span className="font-black text-foreground">{c.usedCount}</span>
                                        <span className="text-muted-foreground/30">/</span>
                                        <span className="text-muted-foreground/50 font-bold">{c.maxUses}</span>
                                    </div>
                                    {c.usedCount >= c.maxUses && (
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 block">Full</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground font-black text-xs">
                                    {new Date(c.createdAt).toLocaleDateString("uk-UA")}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(c.id, c.isActive)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            c.isActive
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                        }`}
                                    >
                                        {c.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                        {c.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-muted-foreground/20 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {codes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/50 font-black uppercase tracking-widest text-xs">
                                    Ще немає жодного коду доступу. Згенеруйте перший!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-border">
                        <div className="px-8 py-8 border-b border-border bg-secondary/30">
                            <h2 className="text-xl font-black text-foreground tracking-tight">Новий код доступу</h2>
                            <p className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest">Згенерувати ключ для активації</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1 tracking-widest">Товар / Продукт</label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-black text-foreground cursor-pointer"
                                >
                                    <option value="" className="bg-card">Оберіть продукт...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id} className="bg-card">
                                            {p.title} ({p.type.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1 tracking-widest">Кількість використань</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-black text-foreground"
                                    placeholder="e.g. 5 for team"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1 tracking-widest">Власний код (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.customCode}
                                    onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                                    className="w-full px-4 py-3 font-mono uppercase bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-black text-foreground"
                                    placeholder="AUTO-GENERATED IF BLANK"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-secondary text-foreground rounded-2xl font-black text-sm hover:bg-secondary/80 transition-all active:scale-95"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
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
