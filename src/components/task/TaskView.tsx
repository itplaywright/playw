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
    }
    isProduction: boolean
}

export default function TaskView({ task, isProduction }: TaskViewProps) {
    const [code, setCode] = useState(task.initialCode)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [output, setOutput] = useState(
        isProduction
            ? "Запуск тестів виконується локально у вашому VS Code."
            : "Запустіть тест, щоб побачити результат..."
    )
    const [isRunning, setIsRunning] = useState(false)

    const handleRun = async () => {
        setIsRunning(true)

        if (task.type === "quiz") {
            if (!selectedOption) {
                toast.error("Будь ласка, оберіть варіант відповіді")
                setIsRunning(false)
                return
            }

            if (selectedOption === task.correctAnswer) {
                setOutput("✅ Правильно! Вітаємо.")
                toast.success("Правильна відповідь!")
                // TODO: Save success result to DB
            } else {
                setOutput("❌ Неправильно. Спробуйте ще раз.")
                toast.error("Неправильна відповідь")
            }
            setIsRunning(false)
            return
        }

        // Web apps cannot write to local files. We must use Clipboard for manual copy if needed.
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
            setOutput(data.logs || data.error || "Тест завершено")
        } catch (err: any) {
            setOutput(`Помилка: ${err.message}`)
        } finally {
            setIsRunning(false)
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
                        disabled={isRunning}
                        className={`rounded px-4 lg:px-6 py-1.5 text-xs lg:text-sm font-medium text-white transition-colors flex-shrink-0 ${isRunning ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isRunning ? "Перевірка..." : (isProduction && task.type === "code" ? "Скопіювати код" : (task.type === "quiz" ? "Виберіть відповідь" : "Запустити"))}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r p-4 lg:p-8 prose prose-slate prose-sm lg:prose-base max-w-none bg-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>

                    {task.options && task.options.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🧠 Перевірка знань
                            </h3>
                            <div className="space-y-3">
                                {task.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedOption(option)
                                            if (option === task.correctAnswer) {
                                                toast.success("✅ Правильно!")
                                            } else {
                                                toast.error("❌ Неправильно")
                                            }
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOption === option
                                            ? (option === task.correctAnswer ? "bg-green-50 border-green-500 ring-1 ring-green-500" : "bg-red-50 border-red-500 ring-1 ring-red-500")
                                            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedOption === option
                                                ? (option === task.correctAnswer ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500")
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
                    )}
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
                                    {output === "Запустіть тест, щоб побачити результат..." ? "Чекаємо на вашу відповідь" : (output.includes("✅") ? "Чудова робота!" : "Спробуйте ще раз")}
                                </h2>
                                <p className="text-gray-400">{output}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
