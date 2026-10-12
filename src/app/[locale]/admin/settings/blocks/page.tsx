"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Save, Loader2, Plus, Pencil, Trash2, X, FileText, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

interface CustomBlock {
    id: number;
    title: string;
    content: string;
    order: number;
    isVisible: boolean;
    locale: string;
}

export default function CustomBlocksPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [locale, setLocale] = useState("uk")
    const [blocks, setBlocks] = useState<CustomBlock[]>([])
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBlock, setEditingBlock] = useState<CustomBlock | null>(null)
    const [formData, setFormData] = useState({ title: "", content: "", isVisible: true })

    useEffect(() => {
        loadBlocks()
    }, [locale])

    const loadBlocks = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/custom-blocks?locale=${locale}`)
            if (res.ok) setBlocks(await res.json())
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const openModal = (block?: CustomBlock) => {
        if (block) {
            setEditingBlock(block)
            setFormData({ title: block.title, content: block.content, isVisible: block.isVisible })
        } else {
            setEditingBlock(null)
            setFormData({ title: "", content: "", isVisible: true })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingBlock(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const method = editingBlock ? "PATCH" : "POST"
            const body = editingBlock 
                ? { id: editingBlock.id, ...formData, locale }
                : { ...formData, order: blocks.length, locale }
                
            const res = await fetch("/api/admin/custom-blocks", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                await loadBlocks()
                closeModal()
                toast.success("Блок збережено")
            }
        } catch (error) {
            toast.error("Помилка збереження")
        } finally {
            setIsSaving(false)
        }
    }

    const moveBlock = async (index: number, dir: 1 | -1) => {
        if (index + dir < 0 || index + dir >= blocks.length) return
        
        const newBlocks = [...blocks]
        const temp = newBlocks[index]
        newBlocks[index] = newBlocks[index + dir]
        newBlocks[index + dir] = temp
        
        setBlocks(newBlocks)
        
        // Save new order
        for (let i = 0; i < newBlocks.length; i++) {
            await fetch("/api/admin/custom-blocks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: newBlocks[i].id, order: i })
            })
        }
    }

    const deleteBlock = async (id: number) => {
        if (!confirm("Видалити блок?")) return
        try {
            await fetch(`/api/admin/custom-blocks?id=${id}`, { method: "DELETE" })
            await loadBlocks()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl pb-24">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Кастомні Блоки
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Додаткові секції на головній сторінці (Markdown)</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {["uk", "en", "ru"].map(l => (
                            <button
                                key={l}
                                onClick={() => setLocale(l)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${locale === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Додати
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : blocks.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Немає блоків для {locale.toUpperCase()}</h3>
                    <p className="text-gray-500 mb-6">Створіть свій перший кастомний блок, який з'явиться на головній сторінці.</p>
                    <button onClick={() => openModal()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                        Створити блок
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {blocks.map((block, idx) => (
                        <div key={block.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{block.title}</h3>
                                    {!block.isVisible && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase">Приховано</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{block.content.substring(0, 100)}...</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col mr-2">
                                    <button disabled={idx === 0} onClick={() => moveBlock(idx, -1)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                                    <button disabled={idx === blocks.length - 1} onClick={() => moveBlock(idx, 1)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                                </div>
                                <button onClick={() => openModal(block)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                                <button onClick={() => deleteBlock(block.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">{editingBlock ? 'Редагувати' : 'Новий блок'} ({locale.toUpperCase()})</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Внутрішня назва (Title)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Markdown Контент</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-mono text-sm"
                                    placeholder="## Заголовок&#10;Текст..."
                                />
                            </div>
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100">
                                <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} className="w-5 h-5 rounded text-blue-600" />
                                <span className="font-bold text-gray-700">Відображати на сайті</span>
                            </label>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200">Скасувати</button>
                                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Зберегти'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
