"use client"

import { motion } from "framer-motion"
import { BarChart3, CheckCircle, RotateCcw } from "lucide-react"

export default function DashboardPreview() {
    return (
        <section className="py-24 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 mb-6 dark:text-blue-400">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Прозорий прогрес</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-foreground mb-8 tracking-tight">Як виглядає твій ріст</h2>
                        <ul className="space-y-8">
                            <li className="flex items-start gap-5">
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                    <span className="text-green-500 font-bold text-lg">%</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">Відсоток проходження</h4>
                                    <p className="text-muted-foreground">Бачиш реальну статистику свого навчання</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-5">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">Статус кожного завдання</h4>
                                    <p className="text-muted-foreground">Розумієш, що вже закріпив, а що треба довчити</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-5">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <RotateCcw className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">Кількість спроб</h4>
                                    <p className="text-muted-foreground">Бачиш, де саме ти застряг і тренуєшся</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 relative"
                    >
                        {/* Abstract visualization of a dashboard Card */}
                        <div className="relative z-10 glass rounded-[2.5rem] p-10 shadow-2xl dark:glass-dark">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-foreground font-bold text-2xl">Твій прогрес</h3>
                                <span className="text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/20">Level 2: Junior</span>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-muted-foreground font-medium">Загальний прогрес</span>
                                        <span className="text-foreground font-bold">67%</span>
                                    </div>
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 w-[67%]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-muted/50 p-6 rounded-[2rem] border border-border">
                                        <span className="text-5xl font-extrabold text-foreground">12</span>
                                        <p className="text-muted-foreground font-medium mt-2">Виконано задач</p>
                                    </div>
                                    <div className="bg-muted/50 p-6 rounded-[2rem] border border-border">
                                        <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">35</span>
                                        <p className="text-muted-foreground font-medium mt-2">Спроб коду</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative background blurs */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10 dark:bg-blue-600/20" />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 dark:bg-purple-600/20" />

                    </motion.div>
                </div>
            </div>
        </section>
    )
}
