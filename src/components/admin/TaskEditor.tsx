"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Monaco from "@/components/editor/Monaco"
import {
    Save,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Code,
    FileText,
    Layout,
    Eye,
    PenLine,
    Bold,
    Italic,
    List,
    Link as LinkIcon,
    Code2,
    Heading1
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TaskEditorProps {
    initialData?: any
    tracks: any[]
}

export default function TaskEditor({ initialData, tracks }: TaskEditorProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        trackId: initialData?.trackId || (tracks[0]?.id || ""),
        difficulty: initialData?.difficulty || "easy",
        initialCode: initialData?.initialCode || "// Write your code here...",
        order: initialData?.order || 0,
        isActive: initialData?.isActive ?? true
    })

    const [isPreview, setIsPreview] = useState(false)

    const insertText = (before: string, after: string = "") => {
        const textarea = document.getElementById("description-editor") as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = formData.description
        const selectedText = text.substring(start, end)

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)

        setFormData({ ...formData, description: newText })

        // Restore selection / focus next tick
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, end + before.length)
        }, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const method = initialData ? "PATCH" : "POST"
            const body = initialData ? { id: initialData.id, ...formData } : formData

            const res = await fetch("/api/admin/tasks", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                router.push("/admin/tasks")
                router.refresh()
            }
        } catch (error) {
            console.error("Error saving task:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between sticky top-[64px] bg-gray-50 py-4 z-20">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {initialData ? 'Редагувати завдання' : 'Нове завдання'}
                        </h1>
                        <p className="text-sm text-gray-500">Заповніть деталі та початковий код</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Зберегти
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Основна інформація</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Назва завдання</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                placeholder="Наприклад: 1.1 Вступ: Перший запуск"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">Опис (Markdown)</label>
                                <div className="flex items-center space-x-2">
                                    {!isPreview && (
                                        <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                                            <button type="button" onClick={() => insertText("**", "**")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Жирний">
                                                <Bold className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("*", "*")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Курсив">
                                                <Italic className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("# ")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Заголовок">
                                                <Heading1 className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("- ")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Список">
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("[", "](url)")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Посилання">
                                                <LinkIcon className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("`", "`")} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 hover:text-black" title="Код">
                                                <Code2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setIsPreview(false)}
                                            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isPreview ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <PenLine className="w-3.5 h-3.5 mr-1.5" />
                                            Редагувати
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPreview(true)}
                                            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isPreview ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                            Попередній перегляд
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isPreview ? (
                                <div className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl prose prose-slate prose-sm max-w-none h-[282px] overflow-y-auto">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {formData.description || "*Немає опису*"}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    id="description-editor"
                                    required
                                    rows={10}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium resize-none font-mono text-sm text-gray-900"
                                    placeholder="Використовуйте Markdown для форматування..."
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center space-x-2 text-purple-600 mb-2">
                            <Code className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Початковий код</h3>
                        </div>
                        <div className="border border-gray-100 rounded-2xl overflow-hidden h-[400px]">
                            <Monaco
                                value={formData.initialCode}
                                onChange={(val) => setFormData({ ...formData, initialCode: val || "" })}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 sticky top-[140px]">
                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                            <Layout className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Параметри</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Навчальний трек</label>
                            <select
                                value={formData.trackId}
                                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                            >
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id}>{track.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Складність</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: level as any })}
                                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${formData.difficulty === level
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                            }`}
                                    >
                                        {level === 'easy' ? 'Легко' : level === 'medium' ? 'Середньо' : 'Складно'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Порядок відображення</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                            />
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-6 w-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Завдання активне</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
