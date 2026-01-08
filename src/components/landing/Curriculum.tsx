"use client"

import { motion } from "framer-motion"
import { ChevronRight, Target, Layout, Database, Terminal } from "lucide-react"

const modules = [
    {
        title: "Основи Playwright",
        icon: Terminal,
        topics: ["Інсталяція та конфігурація", "Робота з локаторами", "Базові дії (click, type, hover)", "Assertions"],
        color: "text-blue-500"
    },
    {
        title: "Page Object Model",
        icon: Layout,
        topics: ["Структура проекту", "Component Object Model", "Рефакторинг тестів", "Clean Code принципи"],
        color: "text-purple-500"
    },
    {
        title: "Advanced Playwright",
        icon: Target,
        topics: ["API Testing", "Authentication & Storage State", "Миттєве перехоплення мережі", "Visual Testing"],
        color: "text-pink-500"
    },
    {
        title: "Best Practices",
        icon: Database,
        topics: ["Parallelization", "Reporter configuration", "CI/CD Integration", "Data-driven testing"],
        color: "text-emerald-500"
    }
]

export default function Curriculum() {
    return (
        <section id="curriculum" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">Програма навчання</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        Покроковий шлях від новачка до впевненого спеціаліста
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                    {modules.map((module, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div className={`h-16 w-16 rounded-2xl bg-muted/50 ${module.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                    <module.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">{module.title}</h3>
                            </div>

                            <ul className="space-y-4">
                                {module.topics.map((topic, tIdx) => (
                                    <li key={tIdx} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                                        <ChevronRight className={`h-5 w-5 ${module.color} shrink-0`} />
                                        <span className="font-medium">{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
