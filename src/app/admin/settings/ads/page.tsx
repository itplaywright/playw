"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Plus,
    Pencil,
    Eye,
    EyeOff,
    Trash2,
    X,
    Loader2,
    Image as ImageIcon,
    FileText,
    MousePointerClick,
    Upload
} from "lucide-react"

interface AdBlock {
    id: number
    title: string
    type: "banner" | "text" | "cta"
    placement: "global" | "task"
    content: string | null
    imageUrl: string | null
    linkUrl: string | null
    buttonText: string | null
    order: number
    isActive: boolean
}

export default function AdsManagerPage() {
    const router = useRouter()
    const [blocks, setBlocks] = useState<AdBlock[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBlock, setEditingBlock] = useState<AdBlock | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        type: "banner" as "banner" | "text" | "cta",
        placement: "global" as "global" | "task",
        content: "",
        imageUrl: "",
        linkUrl: "",
        buttonText: "",
        isActive: true
    })

    useEffect(() => {
        loadBlocks()
    }, [])

    const loadBlocks = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/marketing")
            if (res.ok) {
                const data = await res.json()
                setBlocks(data)
            }
        } catch (error) {
            console.error("Error loading ad blocks:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload
            })

            if (res.ok) {
                const data = await res.json()
                setFormData({ ...formData, imageUrl: data.url })
            } else {
                const error = await res.json()
                alert(error.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload failed")
        } finally {
            setUploadingImage(false)
        }
    }

    const openModal = (block?: AdBlock) => {
        if (block) {
            setEditingBlock(block)
            setFormData({
                title: block.title,
                type: block.type,
                placement: block.placement,
                content: block.content || "",
                imageUrl: block.imageUrl || "",
                linkUrl: block.linkUrl || "",
                buttonText: block.buttonText || "",
                isActive: block.isActive
            })
        } else {
            setEditingBlock(null)
            setFormData({
                title: "",
                type: "banner",
                placement: "global",
                content: "",
                imageUrl: "",
                linkUrl: "",
                buttonText: "",
                isActive: true
            })
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
                ? { id: editingBlock.id, ...formData }
                : { ...formData, order: blocks.length }

            const res = await fetch("/api/admin/marketing", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                await loadBlocks()
                closeModal()
            }
        } catch (error) {
            console.error("Error saving ad block:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleActive = async (block: AdBlock) => {
        try {
            await fetch("/api/admin/marketing", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: block.id, isActive: !block.isActive })
            })
            await loadBlocks()
        } catch (error) {
            console.error("Error toggling status:", error)
        }
    }

    const deleteBlock = async (id: number) => {
        if (!confirm("Видалити цей рекламний блок?")) return

        try {
            await fetch(`/api/admin/marketing?id=${id}`, { method: "DELETE" })
            await loadBlocks()
        } catch (error) {
            console.error("Error deleting block:", error)
        }
    }

    const typeIcons = {
        banner: ImageIcon,
        text: FileText,
        cta: MousePointerClick
    }

    const typeLabels = {
        banner: "Банер",
        text: "Текст",
        cta: "CTA"
    }

    const placementLabels = {
        global: "Глобальний",
        task: "В завданнях"
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Рекламні блоки</h1>
                    <p className="text-sm text-gray-500 mt-1">Керуйте банерами, текстом та CTA кнопками</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Створити блок
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Назва</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Тип</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Розміщення</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Дії</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {blocks.map((block) => {
                            const Icon = typeIcons[block.type]
                            return (
                                <tr key={block.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{block.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                            <Icon className="mr-1 h-3 w-3" />
                                            {typeLabels[block.type]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{placementLabels[block.placement]}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleActive(block)}
                                            className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-lg transition-colors ${block.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                        >
                                            {block.isActive ? <Eye className="mr-1 h-3.5 w-3.5" /> : <EyeOff className="mr-1 h-3.5 w-3.5" />}
                                            {block.isActive ? 'Активний' : 'Вимкнено'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(block)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteBlock(block.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {blocks.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <p>Рекламних блоків поки немає.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingBlock ? 'Редагувати блок' : 'Новий рекламний блок'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Назва</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                                    placeholder="Наприклад: Промо курсу"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Тип</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    >
                                        <option value="banner">Банер</option>
                                        <option value="text">Текст</option>
                                        <option value="cta">CTA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Розміщення</label>
                                    <select
                                        value={formData.placement}
                                        onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    >
                                        <option value="global">Глобальний</option>
                                        <option value="task">В завданнях</option>
                                    </select>
                                </div>
                            </div>

                            {formData.type === "banner" && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Зображення</label>
                                    {formData.imageUrl && (
                                        <div className="mb-3 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Banner preview"
                                                className="max-h-32 mx-auto object-contain"
                                            />
                                        </div>
                                    )}
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.svg"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="flex items-center justify-center px-6 py-3 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition-all cursor-pointer border-2 border-purple-100">
                                            {uploadingImage ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-5 w-5" />
                                            )}
                                            {uploadingImage ? "Завантаження..." : "Завантажити банер"}
                                        </div>
                                    </label>
                                </div>
                            )}

                            {(formData.type === "text" || formData.type === "cta") && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Контент (Markdown)</label>
                                    <textarea
                                        rows={5}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium resize-none font-mono text-sm"
                                        placeholder="Markdown текст..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Посилання</label>
                                <input
                                    type="text"
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                                    placeholder="https://..."
                                />
                            </div>

                            {formData.type === "cta" && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Текст кнопки</label>
                                    <input
                                        type="text"
                                        value={formData.buttonText}
                                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="Наприклад: Дізнатися більше"
                                    />
                                </div>
                            )}

                            <div className="pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-6 w-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Активний</span>
                                </label>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingBlock ? 'Зберегти' : 'Створити')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
