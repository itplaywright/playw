"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import PseudoVideoPlayer from "./PseudoVideoPlayer"
import CodeEditor from "@/components/editor/Monaco"
import Link from "next/link"
import { CheckCircle2, Clock, Terminal, BookOpen, ShieldCheck, MessageSquare, X } from "lucide-react"

interface TaskViewProps {
    task: {
        id: number
        title: string
        description: string
        initialCode: string
        type: "code" | "quiz"
        options?: string[] | null
        correctAnswer?: string | null
        videoUrl?: string | null
        taskQuestions?: {
            id: number
            text: string
            options: string[]
            correctAnswer: string
        }[]
    }
    isProduction: boolean
    nextTask?: { id: number; title: string } | null
    submission?: {
        id: number
        status: "pending" | "reviewed" | "rejected"
        mentorFeedback: string | null
        createdAt: string | Date
        isSeen: boolean
    } | null
}

export default function TaskView({ task, isProduction, nextTask, submission }: TaskViewProps) {
    const [code, setCode] = useState(task.initialCode)
    const [activeConsoleTab, setActiveConsoleTab] = useState<"Output" | "Terminal" | "Mentor">("Output")
    const [isFeedbackBannerDismissed, setIsFeedbackBannerDismissed] = useState(false)
    const consoleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (submission && !submission.isSeen) {
            fetch("/api/user/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId: submission.id })
            }).catch(err => console.error("Error marking as seen:", err))
        }
    }, [submission])

    const scrollToMentor = () => {
        setActiveConsoleTab("Mentor")
        setTimeout(() => {
            consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
    }
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({})
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [output, setOutput] = useState(
        task.type === "quiz"
            ? "Оберіть правильну відповідь для перевірки знань."
            : (isProduction
                ? "Запуск тестів виконується локально у вашому VS Code."
                : "Запустіть тест, щоб побачити результат...")
    )
    const [isRunning, setIsRunning] = useState(false)
    const [questionContent, setQuestionContent] = useState("")
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    // AI Code Review States
    const [isReviewing, setIsReviewing] = useState(false)
    const [reviewResult, setReviewResult] = useState<string | null>(null)
    const [reviewStatus, setReviewStatus] = useState<"SAFE" | "ISSUES" | null>(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)

    // Combine legacy single question with the new taskQuestions if present
    const allQuestions = [
        ...(task.options && task.correctAnswer ? [{
            id: -1, // Legacy marker
            text: task.type === "quiz" ? "Оберіть правильну відповідь" : "Перевірка знань",
            options: task.options,
            correctAnswer: task.correctAnswer
        }] : []),
        ...(task.taskQuestions || [])
    ]

    const totalQuestions = allQuestions.length
    const currentQuestion = allQuestions[currentQuestionIndex]
    const isCompleted = totalQuestions > 0 && Object.keys(answeredQuestions).length === totalQuestions

    const handleRun = async () => {
        setIsRunning(true)

        if (task.type === "quiz") {
            if (totalQuestions > 0 && !isCompleted) {
                if (!selectedOption) {
                    toast.error("Будь ласка, оберіть варіант відповіді")
                } else {
                    handleOptionClick(selectedOption)
                }
            }
            setIsRunning(false)
            return
        }

        // Always attempt validation/run via API
        if (isProduction) {
            await copyToClipboard()
            setOutput("⏳ Код скопійовано! Запуск симуляції (перевірка синтаксису)...")
        } else {
            setOutput("Тест запускається...")
        }

        try {
            const res = await fetch("/api/tasks/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, taskId: task.id }),
            })

            const data = await res.json()
            const finalOutput = data.logs || data.error || "Тест завершено"
            setOutput(prev => isProduction ? prev + "\n\n" + finalOutput : finalOutput)

            if (isProduction && data.status === "passed") {
                setOutput(prev => prev + "\n\n✅ Код підтверджено! Ви можете переходити до наступного завдання.")
            }
        } catch (err: any) {
            setOutput(prev => isProduction ? prev + `\n\nПомилка: ${err.message}` : `Помилка: ${err.message}`)
        }

        setIsRunning(false)
    }

    const handleOptionClick = (option: string) => {
        if (isCompleted) return

        setSelectedOption(option)

        if (option === currentQuestion.correctAnswer) {
            toast.success("✅ Правильно!")
            const newAnswered = { ...answeredQuestions, [currentQuestion.id]: option }
            setAnsweredQuestions(newAnswered)

            // Advance to next question after a small delay
            if (currentQuestionIndex < totalQuestions - 1) {
                setTimeout(() => {
                    setCurrentQuestionIndex(prev => prev + 1)
                    setSelectedOption(null)
                }, 1000)
            } else {
                setOutput("✅ Всі завдання виконано! Вітаємо.")
            }
        } else {
            toast.error("❌ Неправильно. Спробуйте ще раз.")
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            toast.success("Код скопійовано! Вставте його у active.spec.ts")
        } catch (err) {
            toast.error("Не вдалося скопіювати код")
        }
    }

    const handleSubmitQuestion = async () => {
        if (!questionContent.trim()) {
            toast.error("Будь ласка, введіть ваше питання")
            return
        }
        setIsSubmittingQuestion(true)
        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: task.id, content: questionContent }),
            })
            if (res.ok) {
                toast.success("Ваше питання надіслано! Очікуйте відповіді в кабінеті.")
                setQuestionContent("")
            } else {
                toast.error("Не вдалося надіслати питання")
            }
        } catch (err) {
            toast.error("Помилка при відправці")
        } finally {
            setIsSubmittingQuestion(false)
        }
    }
    
    const handleCodeReview = async () => {
        setIsReviewing(true)
        setIsReviewModalOpen(true)
        setReviewResult(null)
        try {
            const res = await fetch("/api/tasks/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, taskId: task.id }),
            })
            const data = await res.json()
            if (res.ok && data.review) {
                const fullText = data.review as string
                if (fullText.startsWith("STATUS: SAFE")) {
                    setReviewStatus("SAFE")
                    setReviewResult(fullText.replace("STATUS: SAFE", "").trim())
                } else if (fullText.startsWith("STATUS: ISSUES")) {
                    setReviewStatus("ISSUES")
                    setReviewResult(fullText.replace("STATUS: ISSUES", "").trim())
                } else {
                    setReviewStatus("ISSUES") // fallback
                    setReviewResult(fullText)
                }
            } else {
                setReviewResult(`Помилка: ${data.error || "Не вдалося отримати рев'ю"}`)
            }
        } catch (err: any) {
            setReviewResult(`Помилка: ${err.message}`)
        } finally {
            setIsReviewing(false)
        }
    }
    const handleSubmitForReview = async () => {
        setIsSubmittingReview(true)
        try {
            const res = await fetch("/api/tasks/submit-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, taskId: task.id }),
            })
            if (res.ok) {
                toast.success("Код надіслано ментору! Відповідь прийде в кабінет.")
            } else {
                const data = await res.json()
                toast.error(data.error || "Не вдалося надіслати код")
            }
        } catch (err) {
            toast.error("Помилка при відправці")
        } finally {
            setIsSubmittingReview(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-premium-dark overflow-hidden font-sans">
            {/* Header */}
            <header className="flex-shrink-0 h-10 header-glass-premium flex items-center px-4 gap-6 z-50">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 group opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                        <Terminal className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs tracking-tight hidden sm:block">IT Playwright</span>
                </Link>

                <div className="h-4 w-px bg-white/5 flex-shrink-0 mx-2" />
                
                <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all flex-shrink-0 text-[10px] font-bold uppercase tracking-wider group">
                    <svg className="h-3 w-3 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Назад</span>
                </Link>

                {/* Task title + Next Task */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <h1 className="text-white text-xs font-bold truncate opacity-90">{task.title}</h1>
                    {nextTask && (
                        <>
                            <div className="h-2 w-px bg-white/5 flex-shrink-0" />
                            <Link
                                href={`/tasks/${nextTask.id}`}
                                className="flex items-center gap-1.5 text-slate-500 hover:text-blue-400 transition-all flex-shrink-0 text-[10px] font-bold uppercase tracking-wider group"
                            >
                                <span className="hidden sm:inline truncate max-w-[150px]">{nextTask.title}</span>
                                <svg className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {task.type === "code" && (
                        <button
                            onClick={() => {
                                if (confirm("Скинути код до початкового стану?")) {
                                    setCode(task.initialCode || "")
                                }
                            }}
                            className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                        >
                            Скинути
                        </button>
                    )}
                    {task.type === "code" && (
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isRunning
                                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                                : isProduction
                                    ? 'glass-panel text-blue-400 border-blue-500/20 hover:bg-blue-500/10'
                                    : 'badge-gradient-blue'
                                }`}
                        >
                            {isRunning ? "Checking..." : (isProduction ? "Copy Code" : "Run Test")}
                        </button>
                    )}
                    {totalQuestions > 0 && task.type !== "quiz" && (
                        <button
                            onClick={() => setIsQuizModalOpen(true)}
                            className="px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            🧠 Тест
                        </button>
                    )}
                    <button
                        onClick={() => setIsQuestionModalOpen(true)}
                        className="px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                        💬 Питання
                    </button>
                    {task.type === "code" && (
                        <button
                            onClick={handleCodeReview}
                            disabled={isReviewing}
                            className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isReviewing
                                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                                : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
                                }`}
                        >
                            🔍 Швидка перевірка
                        </button>
                    )}
                    {task.type === "code" && (
                        <button
                            onClick={handleSubmitForReview}
                            disabled={isSubmittingReview}
                            className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isSubmittingReview
                                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                                }`}
                        >
                            {isSubmittingReview ? "Відправляємо..." : "👨‍🏫 Відправити ментору"}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 p-0 prose prose-invert prose-sm lg:prose-base max-w-none bg-slate-950 custom-scrollbar relative">
                    {/* Sticky Header for Theory */}
                    <div className="sticky top-0 z-20 header-glass-premium px-4 lg:px-8 py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]">
                                <BookOpen className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-white text-sm font-black m-0 tracking-tight uppercase">
                                Теорія та завдання
                            </h2>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase opacity-50">LEVEL {task.id}</span>
                    </div>

                    <div className="p-4 lg:p-8 pt-4 lg:pt-6">
                        {/* Mentor Feedback Banner */}
                        {submission && !submission.isSeen && !isFeedbackBannerDismissed && (
                            <div className={`mb-8 p-6 rounded-[2rem] border animate-in slide-in-from-top duration-700 relative overflow-hidden ${submission.status === 'reviewed'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : submission.status === 'rejected'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                <button 
                                    onClick={() => setIsFeedbackBannerDismissed(true)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all opacity-50 hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${submission.status === 'reviewed' ? 'bg-emerald-500 text-white' : submission.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Фідбек Ментора</h3>
                                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Статус: {submission.status === 'reviewed' ? 'ПРИЙНЯТО' : submission.status === 'rejected' ? 'ПОТРЕБУЄ ВИПРАВЛЕНЬ' : 'В ОЧІКУВАННІ'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={scrollToMentor}
                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest text-white underline underline-offset-4"
                                    >
                                        Детальніше
                                    </button>
                                </div>
                                {submission.status === 'rejected' && (
                                    <p className="text-xs font-medium leading-relaxed opacity-90">Ментор переглянув ваш код та залишив зауваження. Будь ласка, ознайомтеся з фідбеком та внесіть правки.</p>
                                )}
                                {submission.status === 'reviewed' && (
                                    <p className="text-xs font-medium leading-relaxed opacity-90">Чудова робота! Ментор схвалив вашу реалізацію. Ви можете переходити до наступного завдання.</p>
                                )}
                            </div>
                        )}
                        {/* Ukrainian Voiceover Player */}
                        {task.videoUrl && (
                            <div className="not-prose mt-2 mb-8">
                                <PseudoVideoPlayer
                                    videoUrl={task.videoUrl!}
                                    initialCode={task.initialCode}
                                    title={task.title}
                                />
                            </div>
                        )}

                        <div className="markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const hasNewline = String(children).includes('\n');
                                        const isInline = !match && !hasNewline;

                                        if (isInline) {
                                            return <code className="bg-white/10 px-1 rounded text-blue-400 font-mono" {...props}>{children}</code>
                                        }
                                        return (
                                            <div className="border border-white/5 rounded-xl overflow-hidden shadow-2xl my-6">
                                                <div className="bg-[#121212] flex items-center justify-between px-4 py-2 border-b border-white/5">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {match ? `Example Code (${match[1]})` : "Example Code"}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                                    </div>
                                                </div>
                                                <code className="block bg-[#0d0d0d] p-4 text-sm font-mono overflow-x-auto" {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        )
                                    }
                                }}
                            >
                                {task.description}
                            </ReactMarkdown>
                        </div>

                    </div>
                </div>

                {/* Right/Bottom: Editor or Quiz Feedback */}
                <div className="w-full lg:w-1/2 h-[60%] lg:h-full flex flex-col bg-[#1e1e1e]">
                    {task.type === "code" ? (
                        <>
                            <div className="flex-1 min-h-0">
                                <CodeEditor
                                    value={code}
                                    onChange={(val) => setCode(val || "")}
                                />
                            </div>
                            {/* Pro Console Tabs */}
                            <div 
                                ref={consoleRef} 
                                className={`border-t border-white/10 bg-[#0d0d0d] flex flex-col transition-all duration-300 ${
                                    activeConsoleTab === "Mentor" ? "h-64 lg:h-80" : "h-40 lg:h-48"
                                }`}
                            >
                                <div className="flex items-center px-4 border-b border-white/5 bg-[#121212]">
                                    {["Output", "Terminal", "Mentor"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveConsoleTab(tab as any)}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 relative ${activeConsoleTab === tab
                                                ? "text-blue-500 border-blue-500"
                                                : "text-slate-500 border-transparent hover:text-slate-300"
                                                }`}
                                        >
                                            {tab}
                                            {tab === "Mentor" && submission && (
                                                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${submission.status === 'reviewed' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            )}
                                        </button>
                                    ))}
                                    <div className="flex-1" />
                                    <div className="flex gap-1.5 opacity-50">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                    </div>
                                </div>
                                <div className="flex-1 p-4 font-mono text-xs lg:text-sm overflow-y-auto custom-scrollbar">
                                    {activeConsoleTab === "Mentor" ? (
                                        <div className="space-y-4 font-sans">
                                            {!submission ? (
                                                <div className="text-slate-500 text-center py-4">Ви ще не надсилали код на перевірку.</div>
                                            ) : (
                                                <div className={`border border-white/5 rounded-2xl overflow-hidden shadow-2xl ${
                                                    submission.status === 'reviewed' ? 'bg-emerald-500/5' : 
                                                    submission.status === 'rejected' ? 'bg-red-500/5' : 
                                                    'bg-amber-500/5'
                                                }`}>
                                                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${submission.status === 'reviewed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : submission.status === 'rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Статус: {submission.status}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(submission.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    
                                                    <div className="p-6">
                                                        {submission.mentorFeedback ? (
                                                            <>
                                                                <div className="mb-4 flex items-center gap-2 pb-4 border-b border-white/5">
                                                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Коментарі ментора</span>
                                                                </div>
                                                                <div className="prose prose-invert prose-sm max-w-none">
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                        {submission.mentorFeedback}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-slate-400 text-sm leading-relaxed italic text-center py-4">
                                                                Код надіслано ментору. Очікуйте на фідбек найближчим часом. Сповіщення прийде сюди та в кабінет.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {activeConsoleTab === "Output" ? (output || "Консоль готова. Запустіть тест для перевірки...") : "Термінал активний (локально)..."}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] overflow-y-auto custom-scrollbar">
                            {!isCompleted && currentQuestion ? (
                               <div className="p-8 lg:p-12 max-w-2xl mx-auto w-full space-y-8 animate-in mt-1">
                                    <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden backdrop-blur-3xl">
                                        {/* Background accent */}
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20">
                                                    {currentQuestionIndex + 1}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Питання {currentQuestionIndex + 1} з {totalQuestions}</span>
                                                    <div className="flex gap-1">
                                                        {allQuestions.map((_, i) => (
                                                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-4 bg-blue-500' : i < currentQuestionIndex ? 'w-2 bg-emerald-500' : 'w-2 bg-white/10'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-black text-white leading-[1.15] tracking-tight">{currentQuestion.text}</h3>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {currentQuestion.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleOptionClick(option)}
                                                className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 transform active:scale-[0.98] group relative overflow-hidden ${selectedOption === option
                                                    ? (option === currentQuestion.correctAnswer ? "bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10" : "bg-red-500/10 border-red-500 shadow-2xl shadow-red-500/10")
                                                    : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-5 relative z-10">
                                                    <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${selectedOption === option
                                                        ? (option === currentQuestion.correctAnswer ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500")
                                                        : "border-white/10 group-hover:border-blue-500/50"
                                                        }`}>
                                                        {selectedOption === option && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`text-[17px] font-bold tracking-tight transition-colors ${selectedOption === option ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                                                        {option}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-8 text-center">
                                    <div className="max-w-md">
                                        <div className="text-6xl mb-6">{output.includes("✅") ? "🎉" : (output.includes("❌") ? "🤔" : "📝")}</div>
                                        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
                                            {isCompleted ? "Чудова робота!" : (output.includes("✅") ? "Правильно!" : "Спробуйте ще раз")}
                                        </h2>
                                        <p className="text-slate-400 font-medium text-lg mb-8">{output}</p>
                                        {isCompleted && (
                                            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 py-3 px-6 rounded-2xl border border-emerald-500/20">
                                                    <span>Знання підтверджено</span>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                {nextTask && (
                                                    <Link href={`/tasks/${nextTask.id}`} className="block w-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider">
                                                        До наступного завдання
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Code Review Modal */}
            {
                isReviewModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#131b2c] w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-indigo-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🔍</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Рев'ю коду</h2>
                                        <p className="text-xs text-purple-300 font-medium tracking-wide uppercase">АВТОМАТИЧНИЙ АНАЛІЗ</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto prose prose-invert prose-sm md:prose-base max-w-none flex-1">
                                {isReviewing ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-6 relative overflow-hidden">
                                        <div className="absolute inset-0 pointer-events-none z-0">
                                            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40 animate-scan shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                        </div>
                                        <div className="text-6xl animate-bounce relative z-10">🤔</div>
                                        <div className="space-y-2 relative z-10">
                                            <h3 className="text-xl font-bold text-white">Аналізуємо ваш код...</h3>
                                            <p className="text-slate-400 text-sm">Перевіряємо структуру, селектори та Best Practices Playwright.</p>
                                        </div>
                                        <div className="flex gap-1.5 mt-4 relative z-10">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {reviewResult || "Жодного результату. Спробуйте ще раз."}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            {!isReviewing && (
                                <div className="p-4 border-t border-white/10 bg-[#0f172a] text-center">
                                    <button
                                        onClick={() => setIsReviewModalOpen(false)}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                                    >
                                        {reviewStatus === "SAFE" ? "Дякую, зрозуміло!" : "Зрозуміло, йду виправляти"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Quiz Modal */}
            {
                isQuizModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0f172a] w-full max-w-2xl flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-emerald-900/30 to-teal-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🧠</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Перевірка знань</h2>
                                        <p className="text-xs text-emerald-300 font-medium tracking-wide uppercase">Прогрес: {Object.keys(answeredQuestions).length} / {totalQuestions}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsQuizModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                                {!isCompleted ? (
                                    <div className="space-y-6">
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <p className="text-base font-semibold text-slate-100 leading-relaxed">{currentQuestion.text}</p>
                                        </div>
                                        <div className="space-y-3">
                                            {currentQuestion.options.map((option, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleOptionClick(option)}
                                                    className={`w-full text-left p-5 rounded-2xl border transition-all transform active:scale-[0.99] ${selectedOption === option
                                                        ? (option === currentQuestion.correctAnswer ? "bg-emerald-500/20 border-emerald-500/50 ring-1 ring-emerald-500/50" : "bg-red-500/20 border-red-500/50 ring-1 ring-red-500/50")
                                                        : "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${selectedOption === option
                                                            ? (option === currentQuestion.correctAnswer ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500")
                                                            : "border-slate-600"
                                                            }`}>
                                                            {selectedOption === option && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                        </div>
                                                        <span className={`font-medium transition-colors ${selectedOption === option ? "text-white" : "text-slate-300"}`}>{option}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-500/10 p-10 rounded-3xl border border-emerald-500/20 text-center space-y-4">
                                        <div className="text-6xl animate-bounce">🎉</div>
                                        <h4 className="text-2xl font-bold text-emerald-400">Всі питання пройдені!</h4>
                                        <p className="text-slate-400">Ви успішно підтвердили свої знання з цієї теми. Тепер ви готові до практики!</p>
                                        <button
                                            onClick={() => setIsQuizModalOpen(false)}
                                            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                                        >
                                            Чудово, продовжуємо!
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Question Modal */}
            {
                isQuestionModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0a0a0a] w-full max-w-xl flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/30 to-blue-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">💬</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Задати питання</h2>
                                        <p className="text-xs text-indigo-300 font-medium tracking-wide uppercase">Ментор на зв'язку</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsQuestionModalOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Маєте запитання щодо теорії або коду? Опишіть вашу проблему, і ментор допоможе розібратися.
                                </p>
                                <textarea
                                    value={questionContent}
                                    onChange={(e) => setQuestionContent(e.target.value)}
                                    placeholder="Ваше питання (наприклад: чому ми використовуємо саме цей селектор?)"
                                    className="w-full p-5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all min-h-[180px] resize-none text-base text-slate-100 bg-[#1e1e1e] placeholder-slate-600"
                                />
                                <div className="space-y-4">
                                    <button
                                        onClick={async () => {
                                            await handleSubmitQuestion();
                                            if (questionContent === "") setIsQuestionModalOpen(false);
                                        }}
                                        disabled={isSubmittingQuestion}
                                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] ${isSubmittingQuestion
                                            ? "bg-slate-700 cursor-not-allowed"
                                            : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-600/20"
                                            }`}
                                    >
                                        {isSubmittingQuestion ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Надсилаємо...</span>
                                            </div>
                                        ) : "Надіслати питання ментору"}
                                    </button>
                                    <p className="text-xs text-center text-slate-500 font-medium">
                                        Відповідь з’явиться у вашому <Link href="/cabinet" className="text-indigo-400 hover:text-indigo-300 hover:underline">особистому кабінеті</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
