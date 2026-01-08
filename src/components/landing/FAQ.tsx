"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        q: "Чи підійде мені курс, якщо я зовсім не знаю програмування?",
        a: "Так! Ми починаємо з основ. Також наша AI-система допомагає зрозуміти кожний рядок коду."
    },
    {
        q: "Який доступ до платформи я отримую?",
        a: "Після оплати ви отримуєте довічний доступ до завдань та всіх майбутніх оновлень."
    },
    {
        q: "Чим це відрізняється від відео на YouTube?",
        a: "Головна відмінність — практика. Ти не просто дивишся, а пишеш код в браузері, отримуєш миттєву перевірку та фідбек."
    }
]

export default function FAQ() {
    const [openIdx, setOpenIdx] = useState<number | null>(null)

    return (
        <section id="faq" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-4xl font-extrabold text-center text-foreground mb-16 tracking-tight">Поширені запитання</h2>
                <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="rounded-3xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-8 text-left group"
                            >
                                <span className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors dark:group-hover:text-blue-400">
                                    {faq.q}
                                </span>
                                <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${openIdx === idx ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openIdx === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-8 pb-8 text-muted-foreground text-lg leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
