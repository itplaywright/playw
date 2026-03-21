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
}

export default function TaskView({ task, isProduction }: TaskViewProps) {
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

                {/* Task title */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-white text-sm font-semibold truncate">{task.title}</h1>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {task.type === "code" && (
                        <button
                            onClick={() => setCode(task.initialCode)}
                            className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-all"
                        >
                            Скинути
                        </button>
                    )}
                    <button
                        onClick={handleRun}
                        disabled={isRunning || (task.type === "quiz" && isCompleted)}
                        className={`rounded-lg px-4 lg:px-6 py-1.5 text-xs lg:text-sm font-bold text-white transition-all flex-shrink-0 ${isRunning || (task.type === "quiz" && isCompleted)
                            ? 'bg-blue-500/50 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {isRunning ? "Перевірка..." : (isProduction && task.type === "code" ? "Скопіювати" : (task.type === "quiz" ? (isCompleted ? "Виконано" : "Надіслати") : "Запустити"))}
                    </button>
                    {task.type === "code" && (
                        <button
                            onClick={handleCodeReview}
                            disabled={isReviewing}
                            className={`rounded-lg px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-bold text-white transition-all flex-shrink-0 flex items-center gap-2 ${isReviewing
                                ? 'bg-purple-500/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30'
                                }`}
                            title="Отримати фідбек від ментора"
                        >
                            <span>👨‍🏫</span>
                            <span className="hidden lg:inline">{isReviewing ? "Аналізуємо..." : "Code Review"}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 p-4 lg:p-8 prose prose-invert prose-sm lg:prose-base max-w-none bg-[#0a0a0a]">

                    {/* Ukrainian Voiceover Player */}
                    {task.videoUrl && (
                        <div className="not-prose mt-2 mb-6">
                            <PseudoVideoPlayer
                                videoUrl={task.videoUrl!}
                                initialCode={task.initialCode}
                                title={task.title}
                            />
                        </div>
                    )}

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>

                    {totalQuestions > 0 && (
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
                </div >

                {/* Right/Bottom: Editor or Quiz Feedback */}
                < div className="w-full lg:w-1/2 h-[60%] lg:h-full flex flex-col bg-[#1e1e1e]" >
                    {
                        task.type === "code" ? (
                            <>
                                <div className="flex-1 min-h-0">
                                    <CodeEditor
                                        defaultValue={task.initialCode}
                                        onChange={(val) => setCode(val || "")}
                                    />
                                </div>
                                {/* Console Output */}
                                <div className="h-32 lg:h-40 border-t border-gray-700 bg-[#1e1e1e] p-3 lg:p-4 font-mono text-xs lg:text-sm overflow-y-auto">
                                    <div className="text-gray-500 mb-1 lg:mb-2">Консоль виводу:</div>
                                    <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8 text-center">
                                <div className="max-w-md">
                                    <div className="text-6xl mb-4">{output.includes("✅") ? "🎉" : (output.includes("❌") ? "🤔" : "📝")}</div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {isCompleted ? "Чудова робота!" : (output === "Запустіть тест, щоб побачити результат..." ? "Чекаємо на вашу відповідь" : (output.includes("✅") ? "Правильно!" : "Спробуйте ще раз"))}
                                    </h2>
                                    <p className="text-gray-400">{output}</p>
                                    {isCompleted && (
                                        <div className="mt-8 space-y-4">
                                            <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                                                <span>Знання підтверджено</span>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <Link href="/dashboard" className="inline-block bg-blue-600 text-white shadow-lg shadow-blue-600/20 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">
                                                До наступного завдання
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >

            {/* Code Review Modal */}
            {isReviewModalOpen && (
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
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-4">
                                    <div className="text-6xl animate-bounce">🤔</div>
                                    <h3 className="text-xl font-bold text-white">Ментор перевіряє ваш код...</h3>
                                    <p className="text-slate-400">Аналізуємо структуру, селектори та Best Practices.</p>
                                    <div className="flex gap-1 mt-4">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {reviewResult || "Жодного результату. Спробуйте ще раз."}
                                </ReactMarkdown>
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
            )}
        </div >
    )
}
