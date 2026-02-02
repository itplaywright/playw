"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MessageCircle, Clock, CheckCircle, ChevronLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default function UserCabinetPage() {
    const [questions, setQuestions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/questions")
            const data = await res.json()
            setQuestions(Array.isArray(data) ? data : [])
        } catch (error) {
            toast.error("Не вдалося завантажити ваші питання")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="text-gray-500 animate-pulse font-medium">Завантаження кабінету...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Мій кабінет</h1>
                        <p className="text-gray-500 mt-2 font-medium">Керуйте своїми питаннями та переглядайте відповіді менторів.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 text-blue-600 font-bold hover:text-blue-700 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-95"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>До навчання</span>
                    </Link>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Мої питання
                    </h2>

                    {questions.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                            <div className="text-5xl mb-6">💬</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ви ще не ставили питань</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Якщо у вас виникнуть труднощі під час виконання завдань, ви завжди можете запитати ментора.
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                Перейти до завдань
                            </Link>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div key={q.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 p-2 rounded-xl">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-sm text-gray-400 font-medium">
                                                {new Date(q.createdAt).toLocaleDateString()} o {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${q.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            }`}>
                                            {q.status === "pending" ? "В черзі" : "Отримано відповідь"}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ваше питання:</div>
                                        <p className="text-gray-900 font-bold text-lg leading-snug">
                                            "{q.content}"
                                        </p>
                                    </div>

                                    {q.status === "answered" ? (
                                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-emerald-500 p-2 rounded-xl text-white mt-1 shadow-lg shadow-emerald-500/20">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Відповідь ментора:</div>
                                                    <p className="text-gray-800 font-medium leading-relaxed italic">
                                                        {q.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-xs text-gray-400 font-medium flex items-center">
                                                <span className="flex h-2 w-2 rounded-full bg-amber-400 mr-2 animate-pulse" />
                                                Ментор скоро перегляне ваше питання та надасть відповідь тут.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
