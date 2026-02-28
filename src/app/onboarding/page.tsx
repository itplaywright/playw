"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Code2, ArrowRight, Loader2 } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPath, setSelectedPath] = useState<"theory" | "practice" | null>(null)

    const handleSelect = async (path: "theory" | "practice") => {
        setIsLoading(true)
        setSelectedPath(path)
        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ learningPath: path })
            })

            if (res.ok) {
                // Force a hard navigation so session updates correctly from the server
                window.location.href = path === "theory" ? "/theory" : "/dashboard"
            } else {
                setIsLoading(false)
                setSelectedPath(null)
            }
        } catch (error) {
            console.error(error)
            setIsLoading(false)
            setSelectedPath(null)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden px-4">
            {/* Background elements */}
            <div className="absolute top-0 right-1/2 -z-10 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px] dark:bg-blue-600/10" />
            <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px] dark:bg-purple-600/10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl glass border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative dark:glass-dark"
            >
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                        Оберіть свій шлях
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        З чого ви хочете почати своє навчання?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Theory Card */}
                    <button
                        onClick={() => handleSelect("theory")}
                        disabled={isLoading}
                        className={`group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 text-left ${selectedPath === "theory"
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-border bg-muted/30 hover:border-purple-500/50 hover:bg-purple-500/5"
                            }`}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 text-center">Теорія</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Почніть з вивчення матеріалів, лекцій та основних концепцій автоматизації.
                        </p>

                        <div className="mt-auto flex items-center text-purple-600 font-semibold dark:text-purple-400 group-hover:gap-3 transition-all">
                            {isLoading && selectedPath === "theory" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Обрати Теорію
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </div>
                    </button>

                    {/* Practice Card */}
                    <button
                        onClick={() => handleSelect("practice")}
                        disabled={isLoading}
                        className={`group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 text-left ${selectedPath === "practice"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-border bg-muted/30 hover:border-blue-500/50 hover:bg-blue-500/5"
                            }`}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <Code2 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 text-center">Практика</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Відразу перейдіть до виконання завдань, написання коду та тестів.
                        </p>

                        <div className="mt-auto flex items-center text-blue-600 font-semibold dark:text-blue-400 group-hover:gap-3 transition-all">
                            {isLoading && selectedPath === "practice" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Обрати Практику
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
