"use client"

import { useState, useEffect, useRef } from "react"
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
    Heading1,
    Sparkles,
    Video,
    PlayCircle
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
    const [isGenerating, setIsGenerating] = useState(false)
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
    const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "")
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
    const [videoStatus, setVideoStatus] = useState<string>("")
    const [ttsProvider, setTtsProvider] = useState<string>("")
    const [ttsError, setTtsError] = useState<string>("")

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
            const body = initialData
                ? { id: initialData.id, ...formData, videoUrl: videoUrl || null }
                : { ...formData, videoUrl: videoUrl || null }

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

    const handleGenerateVideo = async () => {
        if (!formData.title) {
            alert("Введіть назву завдання для генерації відео.")
            return
        }

        setIsGeneratingVideo(true)
        setVideoStatus("⏳ Генерую скрипт та озвучую...")

        try {
            const res = await fetch("/api/admin/ai/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: initialData?.id || "new-" + Date.now(),
                    title: formData.title,
                    description: formData.description,
                    initialCode: formData.initialCode
                })
            })
            const data = await res.json()

            if (data.videoUrl) {
                setVideoUrl(data.videoUrl)
                setVideoStatus("✅ Відео-озвучка успішно згенерована!")
                setTtsProvider(data.provider || "")
                setTtsError(data.elevenLabsError || "")
            } else {
                setVideoStatus("❌ Помилка: " + (data.error || "Невідома помилка"))
                setTtsProvider("")
                setTtsError("")
                alert(data.error || "Не вдалося згенерувати озвучку")
            }
        } catch (err: any) {
            console.error("Video generation error:", err)
            setVideoStatus("❌ Помилка: " + err.message)
        } finally {
            setIsGeneratingVideo(false)
        }
    }

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            alert("Будь ласка, введіть назву завдання для генерації опису.")
            return
        }

        setIsGenerating(true)
        try {
            const res = await fetch("/api/admin/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: formData.title,
                    type: "description"
                })
            })

            const data = await res.json()

            if (data.content) {
                setFormData(prev => ({ ...prev, description: data.content }))
            } else {
                alert("Не вдалося згенерувати контент: " + (data.error || "Unknown error"))
            }

        } catch (error) {
            console.error("Error generating content:", error)
            alert("Помилка генерації")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between sticky top-[64px] bg-background/80 backdrop-blur-md py-4 z-20 border-b border-border/50">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">
                            {initialData ? 'Редагувати завдання' : 'Нове завдання'}
                        </h1>
                        <p className="text-sm text-muted-foreground font-bold">Заповніть деталі та початковий код</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95"
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Зберегти
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center space-x-2 text-blue-500 mb-2">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-[10px]">Основна інформація</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва завдання</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                placeholder="Наприклад: 1.1 Вступ: Перший запуск"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="block text-[10px] font-black uppercase text-muted-foreground">Опис (Markdown)</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                        className="flex items-center px-2.5 py-1.5 bg-purple-500/10 text-purple-600 rounded-xl text-[10px] font-black hover:bg-purple-500/20 transition-all shadow-sm shadow-purple-500/5 disabled:opacity-50"
                                        title="Згенерувати опис за допомогою AI"
                                    >
                                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                                        AI GPT-4
                                    </button>

                                    {!isPreview && (
                                        <div className="flex bg-secondary/50 rounded-xl p-1">
                                            <button type="button" onClick={() => insertText("**", "**")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Жирний">
                                                <Bold className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("*", "*")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Курсив">
                                                <Italic className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("# ")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Заголовок">
                                                <Heading1 className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("- ")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Список">
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("[", "](url)")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Посилання">
                                                <LinkIcon className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => insertText("`", "`")} className="p-1.5 hover:bg-card rounded-lg transition-all text-muted-foreground hover:text-foreground" title="Код">
                                                <Code2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex bg-secondary/50 rounded-xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => setIsPreview(false)}
                                            className={`flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-card text-blue-600 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <PenLine className="w-3.5 h-3.5 mr-1.5" />
                                            Editor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPreview(true)}
                                            className={`flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-card text-blue-600 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isPreview ? (
                                <div className="w-full px-6 py-6 bg-secondary/30 border border-border rounded-3xl prose prose-slate prose-sm max-w-none h-[282px] overflow-y-auto custom-scrollbar text-foreground">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {formData.description || "*Немає опису... Спробуйте AI Generate!*"}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    id="description-editor"
                                    required
                                    rows={10}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-medium resize-none font-mono text-sm text-foreground custom-scrollbar"
                                    placeholder="Використовуйте Markdown для форматування..."
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center space-x-2 text-purple-500 mb-2">
                            <Code className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-[10px]">Початковий код</h3>
                        </div>
                        <div className="border border-border rounded-2xl overflow-hidden h-[400px] bg-secondary/10">
                            <Monaco
                                value={formData.initialCode}
                                onChange={(val) => setFormData({ ...formData, initialCode: val || "" })}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-6 sticky top-[100px] max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center space-x-2 text-green-500 mb-2">
                            <Layout className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-[10px]">Параметри</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Навчальний трек</label>
                            <select
                                value={formData.trackId}
                                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-foreground text-sm cursor-pointer"
                            >
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id} className="bg-card text-foreground">{track.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Складність</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: level as any })}
                                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${formData.difficulty === level
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 active:scale-95'
                                            : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        {level === 'easy' ? 'Легко' : level === 'medium' ? 'Середньо' : 'Складно'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Порядок відображення</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-foreground text-sm"
                            />
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center space-x-3 cursor-pointer group p-4 bg-secondary/30 rounded-2xl border border-border hover:bg-secondary/50 transition-all">
                                <div 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData({ ...formData, isActive: !formData.isActive });
                                    }}
                                    className={`w-11 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-blue-600" : "bg-muted"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`} />
                                </div>
                                <span className="text-sm font-black text-foreground transition-colors tracking-tight">Завдання активне</span>
                            </label>
                        </div>

                        {/* Video Section - Improved layout to prevent overlaps */}
                        <div className="mt-8 pt-8 border-t border-border space-y-4">
                            <div className="flex items-center space-x-2 text-rose-500 mb-2">
                                <Video className="h-5 w-5" />
                                <h3 className="font-black uppercase tracking-widest text-[10px]">Відео з озвучкою</h3>
                            </div>

                            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
                                Автоматично генерує аудіо-пояснення коду через AI.
                            </p>

                            <button
                                type="button"
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo}
                                className="w-full flex items-center justify-center px-4 py-3 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                {isGeneratingVideo
                                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    : <PlayCircle className="w-4 h-4 mr-2" />
                                }
                                {isGeneratingVideo ? "Генерую..." : "🎬 AI Video Generate"}
                            </button>

                            {videoStatus && !videoUrl && (
                                <p className="text-[9px] text-center font-black text-rose-600 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/10 animate-pulse uppercase tracking-widest">
                                    {videoStatus}
                                </p>
                            )}

                            {videoUrl && (
                                <div className="space-y-4 bg-secondary/30 p-5 rounded-2xl border border-border shadow-inner mt-4">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground">Технологія:</span>
                                        <span className={ttsProvider === "ElevenLabs" ? "text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg" : "text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg"}>
                                            {ttsProvider || "Авто"}
                                        </span>
                                    </div>

                                    {ttsError && ttsProvider === "GoogleTTS" && (
                                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[9px] text-amber-600/80 leading-tight font-bold">
                                            <p className="mb-1 text-amber-600">ElevenLabs fallback:</p>
                                            <p>{ttsError}</p>
                                        </div>
                                    )}

                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Прослухати:</p>
                                    <audio
                                        controls
                                        src={videoUrl}
                                        className="w-full h-8 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                                        onLoadedMetadata={(e) => {
                                            (e.target as HTMLAudioElement).playbackRate = 1.25;
                                        }}
                                    />
                                    <div className="pt-3 border-t border-border flex flex-col gap-2">
                                        <a
                                            href="https://elevenlabs.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1 text-[9px] font-black text-muted-foreground hover:text-blue-500 transition-colors uppercase tracking-widest"
                                        >
                                            Керувати на <span className="underline decoration-blue-500/30">elevenlabs.io</span>
                                        </a>
                                        <p className="text-[9px] text-muted-foreground/50 text-center italic font-bold">
                                            Натисніть «Зберегти» для фіксації
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </form>
    )
}
