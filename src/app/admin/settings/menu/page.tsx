"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    Plus,
    Pencil,
    Eye,
    EyeOff,
    Trash2,
    GripVertical,
    X,
    Loader2,
    ExternalLink,
    Home
} from "lucide-react"

interface MenuItem {
    id: number
    title: string
    url: string
    type: "internal" | "external"
    order: number
    isVisible: boolean
}

function SortableItem({ item, onEdit, onToggle, onDelete }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                    {item.type === "external" && <ExternalLink className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
                    {item.type === "internal" && <Home className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 truncate">{item.url}</p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onToggle(item)}
                    className={`p-2 rounded-lg transition-all ${item.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export default function MenuManagerPage() {
    const router = useRouter()
    const [items, setItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        url: "",
        type: "internal" as "internal" | "external",
        isVisible: true
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        loadMenuItems()
    }, [])

    const loadMenuItems = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/menu")
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (error) {
            console.error("Error loading menu items:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id)
            const newIndex = items.findIndex((item) => item.id === over.id)

            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)

            // Update order in database
            for (let i = 0; i < newItems.length; i++) {
                await fetch("/api/admin/menu", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: newItems[i].id, order: i })
                })
            }
        }
    }

    const openModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                title: item.title,
                url: item.url,
                type: item.type,
                isVisible: item.isVisible
            })
        } else {
            setEditingItem(null)
            setFormData({
                title: "",
                url: "",
                type: "internal",
                isVisible: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const method = editingItem ? "PATCH" : "POST"
            const body = editingItem
                ? { id: editingItem.id, ...formData, order: editingItem.order }
                : { ...formData, order: items.length }

            const res = await fetch("/api/admin/menu", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                await loadMenuItems()
                closeModal()
            }
        } catch (error) {
            console.error("Error saving menu item:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleVisibility = async (item: MenuItem) => {
        try {
            await fetch("/api/admin/menu", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, isVisible: !item.isVisible })
            })
            await loadMenuItems()
        } catch (error) {
            console.error("Error toggling visibility:", error)
        }
    }

    const deleteItem = async (id: number) => {
        if (!confirm("Видалити цей пункт меню?")) return

        try {
            await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" })
            await loadMenuItems()
        } catch (error) {
            console.error("Error deleting item:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Меню навігації</h1>
                    <p className="text-sm text-gray-500 mt-1">Керуйте пунктами меню та їх порядком</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Додати пункт
                </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                {items.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Меню порожнє. Додайте перший пункт!</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        onEdit={openModal}
                                        onToggle={toggleVisibility}
                                        onDelete={deleteItem}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Редагувати пункт' : 'Новий пункт меню'}
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    placeholder="Наприклад: Головна"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">URL</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    placeholder="/dashboard або https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Тип</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "internal" })}
                                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${formData.type === "internal"
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                            }`}
                                    >
                                        Internal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "external" })}
                                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${formData.type === "external"
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                            }`}
                                    >
                                        External
                                    </button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVisible}
                                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                        className="h-6 w-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Видимий</span>
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
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingItem ? 'Зберегти' : 'Створити')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
