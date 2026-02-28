"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Terminal, Download, Code2, ArrowLeft, CheckCircle2, ChevronRight, Boxes, Sparkles, ArrowRight } from "lucide-react"

export default function SetupPage() {
    const [activeStep, setActiveStep] = useState(1)

    const steps = [
        {
            id: 1,
            title: "Node.js",
            icon: <Boxes className="w-6 h-6" />,
            description: "Рушій, який дозволяє запускати JavaScript поза браузером.",
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Завантажте та встановіть Node.js. Рекомендується вибрати версію <strong>LTS (Long Term Support)</strong>.
                    </p>
                    <a
                        href="https://nodejs.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Завантажити Node.js
                    </a>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-500" />
                            Перевірка встановлення
                        </h4>
                        <code className="text-green-400 font-mono">node -v</code>
                        <p className="text-slate-500 text-sm mt-2">Має вивести версію, наприклад v20.x.x</p>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "VS Code",
            icon: <Code2 className="w-6 h-6" />,
            description: "Редактор коду від Microsoft. Швидкий, зі зручними плагінами.",
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Visual Studio Code — це потужний редактор для роботи з тестами.
                    </p>
                    <a
                        href="https://code.visualstudio.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Завантажити VS Code
                    </a>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <h4 className="text-slate-200 font-bold mb-3">Корисні розширення:</h4>
                        <ul className="space-y-3 text-slate-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                <span><strong>Playwright Test for VSCode</strong>: Офіційне розширення для запуску та дебагу тестів прямо з редактора.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                <span><strong>Prettier</strong>: Для автоматичного форматування коду.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: "Git",
            icon: <Terminal className="w-6 h-6" />,
            description: "Система контролю версій. Зберігає історію ваших змін.",
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Git потрібен для завантаження репозиторіїв та збереження вашого коду у хмару (GitHub).
                    </p>
                    <a
                        href="https://git-scm.com/downloads"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Завантажити Git
                    </a>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-500" />
                            Перевірка встановлення
                        </h4>
                        <code className="text-orange-400 font-mono">git --version</code>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            title: "Playwright",
            icon: <Sparkles className="w-6 h-6" />,
            description: "Останній крок — створення вашого першого проекту автотестів.",
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Створіть нову папку на комп'ютері, відкрийте її у VS Code, потім відкрийте термінал у VS Code (Terminal {'>'} New Terminal) і виконайте:
                    </p>

                    <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="ml-2 text-xs text-slate-500 font-mono">bash</span>
                        </div>
                        <div className="p-6">
                            <div className="font-mono text-sm leading-8">
                                <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ npm init playwright@latest</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-indigo-200 mt-6">
                        <p className="font-medium mb-3">Під час встановлення оберіть наступні налаштування:</p>
                        <ul className="list-disc list-inside space-y-1 opacity-80 text-sm">
                            <li>Do you want to use TypeScript or JavaScript? <strong>TypeScript</strong></li>
                            <li>Where to put your end-to-end tests? <strong>tests</strong></li>
                            <li>Add a GitHub Actions workflow? <strong>Yes (або No)</strong></li>
                            <li>Install Playwright browsers? <strong>Yes</strong></li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border mt-10 text-center">
                        <h4 className="text-2xl font-bold text-foreground mb-4">Готові писати код?</h4>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                        >
                            Повернутися до завдань
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-indigo-900/20 to-transparent blur-[120px]" />

            <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
                <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад до дашборду
                </Link>

                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
                        <Terminal className="w-3 h-3" />
                        Інструкція
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
                        Налаштування <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                            середовища
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Кілька кроків для підготовки комп'ютера до автоматизації. Зробіть це один раз, і ви готові писати тести.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Navigation Sidebar */}
                    <div className="md:w-1/3 shrink-0">
                        <div className="sticky top-24 space-y-2">
                            {steps.map((step) => (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(step.id)}
                                    className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between ${activeStep === step.id
                                        ? "bg-slate-900 border-l-4 border-indigo-500 text-foreground shadow-lg"
                                        : "hover:bg-muted/50 text-muted-foreground border-l-4 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${activeStep === step.id ? "bg-indigo-500/20 text-indigo-400" : "bg-muted text-muted-foreground"}`}>
                                            {step.icon}
                                        </div>
                                        <span className="font-bold text-lg">{step.title}</span>
                                    </div>
                                    {activeStep === step.id && <ChevronRight className="w-5 h-5 text-indigo-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:w-2/3">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={activeStep === step.id ? "block" : "hidden"}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-background/50 backdrop-blur-md border border-border rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />

                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-extrabold mb-4">{step.title}</h2>
                                        <p className="text-xl text-indigo-400 mb-8 font-medium">
                                            {step.description}
                                        </p>
                                        {step.content}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
