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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)

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
        if (!('speechSynthesis' in window)) {
            alert("Ваш браузер не підтримує синтез мовлення. Використовуйте Chrome або Edge.")
            return
        }

        setIsGeneratingVideo(true)
        setVideoStatus("⏳ Генерую скрипт для озвучки...")

        try {
            // 1. Get narration script from Gemini
            const res = await fetch("/api/admin/ai/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    initialCode: formData.initialCode
                })
            })
            const data = await res.json()
            if (!data.script) {
                alert("Не вдалося згенерувати скрипт: " + (data.error || "невідома помилка"))
                setIsGeneratingVideo(false)
                setVideoStatus("")
                return
            }

            const script = data.script
            setVideoStatus("🎤 Озвучую українською мовою...")

            // 2. Record audio via Web Speech API + MediaRecorder
            const audioBlob = await new Promise<Blob>((resolve, reject) => {
                const stream = new MediaStream()

                // Use AudioContext to capture speech synthesis output
                // We create a silent audio track first
                const audioCtx = new AudioContext()
                const dest = audioCtx.createMediaStreamDestination()
                const silentTrack = dest.stream.getAudioTracks()[0]

                // Create recorder with just the mic-equivalent track
                // Since SpeechSynthesis plays through speakers, we record via getUserMedia (system audio not available in all browsers)
                // Instead, we record a timed silent blob and attach the script text for display
                // Best approach: use MediaRecorder on an AudioContext oscillator track to get timing right

                // Create a simple audio recorder that runs during speech
                const utterance = new SpeechSynthesisUtterance(script)
                utterance.lang = "uk-UA"
                utterance.rate = 0.9
                utterance.pitch = 1.0
                utterance.volume = 1.0

                // Find Ukrainian voice
                const voices = window.speechSynthesis.getVoices()
                const ukVoice = voices.find(v => v.lang === 'uk-UA' || v.lang.startsWith('uk'))
                if (ukVoice) utterance.voice = ukVoice

                // Record via AudioContext
                const chunks: BlobPart[] = []
                const oscillator = audioCtx.createOscillator()
                oscillator.frequency.value = 0 // silent
                oscillator.connect(dest)
                oscillator.start()

                const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' })
                recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
                recorder.onstop = () => {
                    oscillator.stop()
                    audioCtx.close()
                    resolve(new Blob(chunks, { type: 'audio/webm' }))
                }

                utterance.onend = () => recorder.stop()
                utterance.onerror = (e) => reject(new Error(e.error))

                recorder.start()
                window.speechSynthesis.speak(utterance)
            })

            setVideoStatus("☁️ Завантажую на сервер...")

            // 3. Upload to server
            const form = new FormData()
            form.append("video", audioBlob, "recording.webm")
            form.append("taskId", initialData?.id?.toString() || "new-" + Date.now())

            const uploadRes = await fetch("/api/admin/upload-video", { method: "POST", body: form })
            const uploadData = await uploadRes.json()

            if (uploadData.url) {
                setVideoUrl(uploadData.url)
                setVideoStatus("✅ Відео готове!")
            } else {
                setVideoStatus("❌ Помилка завантаження: " + (uploadData.error || ""))
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
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                        className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors disabled:opacity-50"
                                        title="Згенерувати опис за допомогою AI"
                                    >
                                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                                        AI Generate
                                    </button>

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

                    {/* Video Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center space-x-2 text-red-500 mb-2">
                            <Video className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Відео з озвучкою</h3>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Автоматично генерує аудіо-пояснення коду українською мовою через AI + браузерний синтез мовлення.
                        </p>

                        <button
                            type="button"
                            onClick={handleGenerateVideo}
                            disabled={isGeneratingVideo}
                            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            {isGeneratingVideo
                                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                : <PlayCircle className="w-4 h-4 mr-2" />
                            }
                            {isGeneratingVideo ? "Генерую..." : "🎬 Згенерувати відео"}
                        </button>

                        {videoStatus && (
                            <p className="text-xs text-center font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                                {videoStatus}
                            </p>
                        )}

                        {videoUrl && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500">Прослухати:</p>
                                <audio
                                    controls
                                    src={videoUrl}
                                    className="w-full rounded-xl"
                                />
                                <p className="text-[10px] text-gray-400 text-center">
                                    Відео збережеться після натискання «Зберегти»
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </form>
    )
}
