"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-background">
            {/* Background animated gradients */}
            <div className="absolute top-0 left-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[130px] animate-pulse dark:bg-blue-600/20" />
            <div className="absolute top-1/2 right-0 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-600/20" />
            <div className="absolute bottom-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-pink-600/5 blur-[150px] dark:bg-pink-600/10" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto max-w-5xl"
                >
                    <div className="mb-8 inline-flex items-center rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-blue-600 backdrop-blur-md shadow-lg shadow-blue-500/5 dark:text-blue-400 dark:bg-white/5">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                            Playwright + TypeScript
                        </span>
                    </div>

                    <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
                        Навчись автоматизації на{" "}
                        <span className="text-gradient">
                            Playwright
                        </span>{" "}
                        через практику
                    </h1>

                    <p className="mx-auto mb-12 max-w-3xl text-xl text-muted-foreground sm:text-2xl leading-relaxed">
                        Без води та нудних лекцій. <br className="hidden sm:block" />
                        Пиши реальні тести в браузері та стань Pro в автоматизації.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                        <Link
                            href="/register"
                            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            <span>Почати практику безкоштовно</span>
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                            href="#curriculum"
                            className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-card/50 px-10 text-lg font-bold text-foreground backdrop-blur-md transition-all hover:bg-card/80 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            Програма курсу
                        </Link>
                    </div>

                </motion.div>
            </div>
        </section>
    )
}
