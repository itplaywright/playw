"use client"

import { useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import PseudoVideoPlayer from "./PseudoVideoPlayer"
import CodeEditor from "@/components/editor/Monaco"
import Link from "next/link"

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
}

export default function TaskView({ task, isProduction, nextTask }: TaskViewProps) {
    const [code, setCode] = useState(task.initialCode)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({})
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [output, setOutput] = useState(
        isProduction
            ? "Запуск тестів виконується локально у вашому VS Code."
            : "Запустіть тест, щоб побачити результат..."
    )
    const [isRunning, setIsRunning] = useState(false)
    const [questionContent, setQuestionContent] = useState("")
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

    // AI Code Review States
    const [isReviewing, setIsReviewing] = useState(false)
    const [reviewResult, setReviewResult] = useState<string | null>(null)
    const [reviewStatus, setReviewStatus] = useState<"SAFE" | "ISSUES" | null>(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

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

        if (task.type === "quiz" && totalQuestions > 0 && !isCompleted) {
            if (!selectedOption) {
                toast.error("Будь ласка, оберіть варіант відповіді")
                setIsRunning(false)
                return
            }

            handleOptionClick(selectedOption)
            setIsRunning(false)
            return
        }

        // Always attempt validation/run via API
        if (isProduction) {
            setOutput("⏳ Запуск симуляції (перевірка синтаксису)...")
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
            setOutput(finalOutput)

            // In production, if validation passed, copy to clipboard
            if (isProduction && data.status === "passed") {
                await copyToClipboard()
                setOutput(prev => prev + "\n\n✅ Код підтверджено та скопійовано! Вставте його у файл tests/active.spec.ts та запустіть npx playwright test для перевірки.")
            }
        } catch (err: any) {
            setOutput(`Помилка: ${err.message}`)
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

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 h-14 bg-[#0f172a] border-b border-white/10 flex items-center px-4 lg:px-6 gap-4">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 group">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight hidden sm:block">IT Playwright</span>
                </Link>

                {/* Divider + back */}
                <div className="h-5 w-px bg-white/10 flex-shrink-0 hidden sm:block" />
                <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors flex-shrink-0 text-xs font-medium">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Назад</span>
                </Link>

                {/* Task title + Next Task */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <h1 className="text-white text-sm font-semibold truncate">{task.title}</h1>
                    {nextTask && (
                        <>
                            <div className="h-3 w-px bg-white/10 flex-shrink-0" />
                            <Link
                                href={`/tasks/${nextTask.id}`}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors flex-shrink-0 text-xs font-medium group"
                            >
                                <span className="hidden sm:inline truncate max-w-[150px]">{nextTask.title}</span>
                                <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm"
                        >
                            Скинути
                        </button>
                    )}
                    <button
                        onClick={handleRun}
                        disabled={isRunning || (task.type === "quiz" && isCompleted)}
                        className={`rounded-lg px-4 lg:px-6 py-1.5 text-xs lg:text-sm font-bold transition-all flex-shrink-0 border-2 ${isRunning || (task.type === "quiz" && isCompleted)
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-300/50 cursor-not-allowed'
                            : isProduction && task.type === "code"
                                ? 'bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/10 shadow-lg shadow-blue-500/5'
                                : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {isRunning ? "Перевірка..." : (isProduction && task.type === "code" ? "Скопіювати" : (task.type === "quiz" ? (isCompleted ? "Виконано" : "Надіслати") : "Запустити"))}
                    </button>
                    {task.type === "code" && (
                        <button
                            onClick={handleCodeReview}
                            disabled={isReviewing}
                            className={`rounded-lg px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-bold text-white transition-all flex-shrink-0 flex items-center gap-2 relative overflow-hidden group ${isReviewing
                                ? 'bg-purple-500/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                                }`}
                            title="Отримати фідбек від ментора"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative z-10">👨‍🏫</span>
                            <span className="hidden lg:inline relative z-10">{isReviewing ? "Аналізуємо..." : "Code Review"}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 p-0 prose prose-invert prose-sm lg:prose-base max-w-none bg-[#0a0a0a] custom-scrollbar">
                    {/* Sticky Header for Theory */}
                    <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md px-4 lg:px-8 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-white text-base lg:text-lg font-bold m-0 flex items-center gap-2">
                            <span className="text-blue-500">📖</span> Теорія та завдання
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">IT Playwright</span>
                    </div>

                    <div className="p-4 lg:p-8 pt-4 lg:pt-6">
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
                                    code({ node, inline, className, children, ...props }: any) {
                                        if (inline) {
                                            return <code className="bg-white/10 px-1 rounded text-blue-400" {...props}>{children}</code>
                                        }
                                        return (
                                            <div className="border border-white/5 rounded-xl overflow-hidden shadow-2xl my-6">
                                                <div className="bg-[#121212] flex items-center justify-between px-4 py-2 border-b border-white/5">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Example Code</span>
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

                        {
                            totalQuestions > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            🧠 Перевірка знань
                                        </h3>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                            {Object.keys(answeredQuestions).length} / {totalQuestions}
                                        </span>
                                    </div>

                                    {!isCompleted ? (
                                        <div className="space-y-4">
                                            <p className="text-sm font-semibold text-slate-200">{currentQuestion.text}</p>
                                            <div className="space-y-3">
                                                {currentQuestion.options.map((option, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleOptionClick(option)}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOption === option
                                                            ? (option === currentQuestion.correctAnswer ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50" : "bg-red-500/10 border-red-500/50 ring-1 ring-red-500/50")
                                                            : "bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10"
                                                            }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedOption === option
                                                                ? (option === currentQuestion.correctAnswer ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500")
                                                                : "border-gray-300"
                                                                }`}>
                                                                {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <span className="font-medium text-slate-200">{option}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
                                            <div className="text-4xl mb-2">🎉</div>
                                            <h4 className="font-bold text-emerald-400">Всі питання пройдені!</h4>
                                            <p className="text-sm text-emerald-500/80">Ви успішно підтвердили свої знання.</p>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        <div className="mt-8 pt-6 border-t border-white/10 mb-8 pb-8">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                                💬 Задати питання
                            </h3>
                            <div className="space-y-4">
                                <textarea
                                    value={questionContent}
                                    onChange={(e) => setQuestionContent(e.target.value)}
                                    placeholder="Ваше питання до ментора (наприклад, чому цей селектор кращий?)"
                                    className="w-full p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all min-h-[120px] resize-none text-sm text-slate-200 bg-[#1e1e1e]"
                                />
                                <button
                                    onClick={handleSubmitQuestion}
                                    disabled={isSubmittingQuestion}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${isSubmittingQuestion
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                        }`}
                                >
                                    {isSubmittingQuestion ? "Надсилаємо..." : "Надіслати питання"}
                                </button>
                                <p className="text-[11px] text-center text-slate-500 font-medium">
                                    Відповідь з’явиться у вашому <Link href="/cabinet" className="text-blue-500 hover:underline">особистому кабінеті</Link>.
                                </p>
                            </div>
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
                            <div className="h-40 lg:h-48 border-t border-white/10 bg-[#0d0d0d] flex flex-col">
                                <div className="flex items-center px-4 border-b border-white/5 bg-[#121212]">
                                    {["Output", "Terminal", "Mentor"].map((tab) => (
                                        <button
                                            key={tab}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${tab === "Output"
                                                ? "text-blue-500 border-blue-500"
                                                : "text-slate-500 border-transparent hover:text-slate-300"
                                                }`}
                                        >
                                            {tab}
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
                                    <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {output || "Консоль готова. Запустіть тест для перевірки..."}
                                    </pre>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-center bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a]">
                            <div className="max-w-md">
                                <div className="text-6xl mb-4">{output.includes("✅") ? "🎉" : (output.includes("❌") ? "🤔" : "📝")}</div>
                                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                    {isCompleted ? "Чудова робота!" : (output === "Запустіть тест, щоб побачити результат..." ? "Чекаємо на вашу відповідь" : (output.includes("✅") ? "Правильно!" : "Спробуйте ще раз"))}
                                </h2>
                                <p className="text-slate-400 font-medium">{output}</p>
                                {isCompleted && (
                                    <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-full border border-emerald-500/20">
                                            <span>Знання підтверджено</span>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        {nextTask && (
                                            <Link href={`/tasks/${nextTask.id}`} className="inline-block bg-blue-600 text-white shadow-lg shadow-blue-600/20 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95">
                                                До наступного завдання
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                    <div className="text-2xl">👨‍🏫</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Code Review</h2>
                                        <p className="text-xs text-purple-300 font-medium tracking-wide">ВІДГУК МЕНТОРА</p>
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
                                        {/* Scanning Line Animation */}
                                        <div className="absolute inset-0 pointer-events-none z-0">
                                            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40 animate-scan shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                        </div>

                                        <div className="text-6xl animate-bounce relative z-10">🤔</div>
                                        <div className="space-y-2 relative z-10">
                                            <h3 className="text-xl font-bold text-white">Ментор аналізує ваш код...</h3>
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
                                        {reviewStatus === "SAFE" ? "Дякую, менторе!" : "Зрозуміло, йду виправляти"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
