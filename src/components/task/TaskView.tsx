"use client"

import { useState } from "react"
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
    }
    isProduction: boolean
}

export default function TaskView({ task, isProduction }: TaskViewProps) {
    const [code, setCode] = useState(task.initialCode)
    const [output, setOutput] = useState(
        isProduction
            ? "У Production-режимі (Netlify) запуск тестів виконується локально у вашому VS Code."
            : "Запустіть тест, щоб побачити результат..."
    )
    const [isRunning, setIsRunning] = useState(false)

    const handleRun = async () => {
        setIsRunning(true)

        if (isProduction) {
            // Emulate "Run in VS Code"
            setOutput("✅ Код збережено! Тепер відкрийте цей проєкт у VS Code і запустіть тест:\n\n> npx playwright test")
            setIsRunning(false)
            return
        }

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
        } finally {
            setIsRunning(false)
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
                    <button
                        onClick={() => setCode(task.initialCode)}
                        className="rounded bg-gray-200 px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-medium hover:bg-gray-300"
                    >
                        Скинути
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`rounded px-4 lg:px-6 py-1.5 text-xs lg:text-sm font-medium text-white transition-colors flex-shrink-0 ${isRunning ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isRunning ? "Запуск..." : (isProduction ? "Зберегти для VS Code" : "Запустити")}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left/Top: Description */}
                <div className="w-full lg:w-1/2 h-[40%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r p-4 lg:p-8 prose prose-slate prose-sm lg:prose-base max-w-none bg-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
                </div>

                {/* Right/Bottom: Editor */}
                <div className="w-full lg:w-1/2 h-[60%] lg:h-full flex flex-col bg-[#1e1e1e]">
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
                </div>
            </div>
        </div>
    )
}
