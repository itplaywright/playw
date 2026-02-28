"use client"

import { useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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

        // Web apps cannot write to local files. We must use Clipboard for manual copy if needed.
        if (isProduction) {
            setOutput("⏳ Запуск симуляції (перевірка синтаксису)...")
            await copyToClipboard()
        } else {
            setOutput("Тест запускається...")
            try {
                const res = await fetch("/api/tasks/run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, taskId: task.id }),
                })

                const data = await res.json()
                setOutput(data.logs || data.error || "Тест завершено")
            } catch (err: any) {
                setOutput(`Помилка: ${err.message}`)
            }
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

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Header */}
            <header className="flex h-auto min-h-[3.5rem] py-2 lg:py-0 items-center justify-between border-b px-4 lg:px-6 bg-gray-50 flex-wrap gap-2">
                <div className="flex items-center space-x-3 lg:space-x-4 min-w-0">
                    <Link href="/dashboard" className="text-gray-500 hover:text-black flex-shrink-0">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-base lg:text-lg font-semibold truncate">{task.title}</h1>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                    {task.type === "code" && (
                        <button
                            onClick={() => setCode(task.initialCode)}
                            className="rounded bg-gray-200 px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-medium hover:bg-gray-300"
                        >
                            Скинути
                        </button>
                    )}
                    <button
                        onClick={handleRun}
                        disabled={isRunning || (task.type === "quiz" && isCompleted)}
                        className={`rounded px-4 lg:px-6 py-1.5 text-xs lg:text-sm font-medium text-white transition-colors flex-shrink-0 ${isRunning || (task.type === "quiz" && isCompleted) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isRunning ? "Перевірка..." : (isProduction && task.type === "code" ? "Скопіювати код" : (task.type === "quiz" ? (isCompleted ? "Виконано" : "Надіслати") : "Запустити"))}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r p-4 lg:p-8 prose prose-slate prose-sm lg:prose-base max-w-none bg-white">
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
                                    <p className="text-sm font-semibold text-gray-700">{currentQuestion.text}</p>
                                    <div className="space-y-3">
                                        {currentQuestion.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleOptionClick(option)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOption === option
                                                    ? (option === currentQuestion.correctAnswer ? "bg-green-50 border-green-500 ring-1 ring-green-500" : "bg-red-50 border-red-500 ring-1 ring-red-500")
                                                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedOption === option
                                                        ? (option === currentQuestion.correctAnswer ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500")
                                                        : "border-gray-300"
                                                        }`}>
                                                        {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{option}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <h4 className="font-bold text-green-800">Всі питання пройдені!</h4>
                                    <p className="text-sm text-green-700">Ви успішно підтвердили свої знання.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 mb-8 pb-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            💬 Задати питання
                        </h3>
                        <div className="space-y-4">
                            <textarea
                                value={questionContent}
                                onChange={(e) => setQuestionContent(e.target.value)}
                                placeholder="Ваше питання до ментора (наприклад, чому цей селектор кращий?)"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all min-h-[120px] resize-none text-sm text-gray-700 bg-gray-50/50"
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
                            <p className="text-[11px] text-center text-gray-400 font-medium">
                                Відповідь з’явиться у вашому <Link href="/cabinet" className="text-blue-500 hover:underline">особистому кабінеті</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right/Bottom: Editor or Quiz Feedback */}
                <div className="w-full lg:w-1/2 h-[60%] lg:h-full flex flex-col bg-[#1e1e1e]">
                    {task.type === "code" ? (
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
                                        <Link href="/dashboard" className="inline-block bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                            До наступного завдання
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
