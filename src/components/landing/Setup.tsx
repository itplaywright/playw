"use client"

import { motion } from "framer-motion"
import { Download, Laptop, Terminal, Chrome, CheckCircle2 } from "lucide-react"

const setupSteps = [
    {
        title: "Встанови Node.js",
        desc: "Завантаж та встанови останню LTS версію Node.js з офіційного сайту. Це середовище для запуску твоїх тестів.",
        icon: Download,
        color: "bg-green-500",
        link: "https://nodejs.org/",
        linkText: "Скачати Node.js"
    },
    {
        title: "Встанови VS Code",
        desc: "Найкращий редактор для розробки тестів. Має чудову підтримку TypeScript та Playwright.",
        icon: Laptop,
        color: "bg-blue-500",
        link: "https://code.visualstudio.com/",
        linkText: "Скачати VS Code"
    },
    {
        title: "Розширення Playwright",
        desc: "Встанови розширення 'Playwright Test for VS Code' з маркетплейсу. Це дозволить запускати тести одним кліком.",
        icon: Chrome,
        color: "bg-orange-500",
    },
    {
        title: "Ініціалізація",
        desc: "Запусти в терміналі команду: npm init playwright@latest. Це створить структуру проекту та встановить браузери.",
        icon: Terminal,
        color: "bg-purple-500",
        code: "npm init playwright@latest"
    }
]

export default function Setup() {
    return (
        <section id="setup" className="py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Підготовка до роботи</h2>
                    <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                        Налаштуйте своє робоче оточення для локальної розробки автотестів
                    </p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
                    {setupSteps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:border-blue-500/50 transition-colors group relative"
                        >
                            <div className="flex gap-6 items-start">
                                <div className={`flex-shrink-0 h-14 w-14 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                                    <step.icon className="h-7 w-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Крок {idx + 1}</span>
                                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-zinc-400 leading-relaxed mb-6">{step.desc}</p>

                                    {step.link && (
                                        <a
                                            href={step.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                        >
                                            {step.linkText}
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Ref 10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}

                                    {step.code && (
                                        <div className="mt-4 bg-black/50 p-4 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                            <code className="text-blue-400 font-mono text-sm">{step.code}</code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 flex justify-center"
                >
                    <div className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Готово! Тепер ти готовий до практики
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
