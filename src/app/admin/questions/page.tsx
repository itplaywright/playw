"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MessageCircle, Clock, CheckCircle, Send } from "lucide-react"

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({})

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/questions")
            const data = await res.json()
            setQuestions(data)
        } catch (error) {
            toast.error("Не вдалося завантажити запитання")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswer = async (id: number) => {
        const answer = answers[id]
        if (!answer?.trim()) {
            toast.error("Введіть відповідь")
            return
        }

        setIsSubmitting(prev => ({ ...prev, [id]: true }))
        try {
            const res = await fetch(`/api/admin/questions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer }),
            })
            if (res.ok) {
                toast.success("Відповідь надіслана!")
                fetchQuestions()
                setAnswers(prev => ({ ...prev, [id]: "" }))
            } else {
                toast.error("Помилка при відправці")
            }
        } catch (err) {
            toast.error("Помилка мережі")
        } finally {
            setIsSubmitting(prev => ({ ...prev, [id]: false }))
        }
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Завантаження...</div>

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Запитання користувачів</h1>
                <p className="text-gray-500">Відповідайте на запитання для покращення навчання.</p>
            </div>

            <div className="space-y-6">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Запитань поки немає</h3>
                        <p className="text-gray-500 mt-1">Ми повідомимо вас, коли користувачі щось запитають.</p>
                    </div>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${q.status === "pending" ? "border-blue-100 shadow-sm" : "border-gray-100 opacity-80"}`}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                                            {q.user?.email?.[0] || "U"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{q.user?.email}</p>
                                            <div className="flex items-center text-xs text-gray-400 space-x-3">
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(q.createdAt).toLocaleString()}
                                                </span>
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">
                                                    Завдання: {q.task?.title || q.taskId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${q.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                                        }`}>
                                        {q.status === "pending" ? "Очікує" : "Відповіли"}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        "{q.content}"
                                    </p>
                                </div>

                                {q.status === "answered" ? (
                                    <div className="pt-4 border-t border-gray-50">
                                        <div className="flex items-start space-x-3 text-sm">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 mb-1">Ваша відповідь ({new Date(q.answeredAt).toLocaleDateString()}):</p>
                                                <p className="text-gray-900 font-medium italic">"{q.answer}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <textarea
                                            placeholder="Введіть вашу відповідь..."
                                            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-sm min-h-[100px]"
                                            value={answers[q.id] || ""}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        />
                                        <button
                                            onClick={() => handleAnswer(q.id)}
                                            disabled={isSubmitting[q.id]}
                                            className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-white transition-all ${isSubmitting[q.id] ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                                                }`}
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{isSubmitting[q.id] ? "Надсилаємо..." : "Надіслати відповідь"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
