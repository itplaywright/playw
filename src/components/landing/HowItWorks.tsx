"use client"

import { motion } from "framer-motion"
import { Code2, Play, Search, GraduationCap } from "lucide-react"

const steps = [
    {
        title: "Обираєш завдання",
        desc: "Від простих селекторів до архітектури Page Object",
        icon: Search,
        color: "bg-blue-500",
    },
    {
        title: "Пишеш код",
        desc: "Прямо в браузері через зручний редактор з підказками",
        icon: Code2,
        color: "bg-purple-500",
    },
    {
        title: "Запускаєш тести",
        desc: "Миттєвий фідбек від перевіряючої системи",
        icon: Play,
        color: "bg-emerald-500",
    },
    {
        title: "Отримуєш результат",
        desc: "Документація, досвід та готові рішення в твій багаж",
        icon: GraduationCap,
        color: "bg-amber-500",
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">Як це працює?</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        Замість нудної теорії — реальний досвід через 4 прості кроки
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group h-full"
                        >
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-[calc(100%-20px)] w-full h-[2px] bg-gradient-to-r from-border to-transparent z-0" />
                            )}

                            <div className="relative h-full flex flex-col items-center p-8 rounded-[2.5rem] bg-card border border-border shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 z-10">
                                <div className={`h-16 w-16 rounded-2xl ${step.color} flex items-center justify-center text-white mb-8 shadow-lg shadow-${step.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                                <p className="text-muted-foreground text-center line-relaxed">{step.desc}</p>

                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-border flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {idx + 1}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
