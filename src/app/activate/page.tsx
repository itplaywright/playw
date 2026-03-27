"use client"

import { useState } from "react"
import { Key } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ActivatePage() {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setIsLoading(true)

        try {
            const res = await fetch("/api/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim() })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Код успішно активовано!")
                setTimeout(() => {
                    router.push("/dashboard")
                    router.refresh()
                }, 1000)
            } else {
                toast.error(data.error || "Не вдалося активувати код")
            }
        } catch (error) {
            toast.error("Сталася помилка. Спробуйте пізніше.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-blue-50/20 -z-10" />
                    
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center rotate-3 shadow-inner">
                            <Key className="w-8 h-8 text-indigo-600 -rotate-3" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Активація доступу</h1>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            Введіть ваш промокод або B2B-інвайт, щоб розблокувати преміум матеріали.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-2xl focus:bg-white outline-none transition-all font-mono text-center text-lg uppercase tracking-widest placeholder:text-gray-300 placeholder:tracking-normal"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !code.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading ? "Перевірка..." : "Активувати"}
                        </button>
                    </form>
                </div>
                <div className="mt-8 text-center px-4">
                    <p className="text-xs text-gray-400 font-medium">
                        Доступ відкривається миттєво після авто-перевірки. При виникненні питань звертайтеся до підтримки або вашого тімліда.
                    </p>
                </div>
            </div>
        </div>
    )
}
