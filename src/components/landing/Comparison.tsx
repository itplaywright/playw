"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const comparisons = [
    { feature: "Практика в браузері", usual: false, ours: true },
    { feature: "Реальні сценарії", usual: "Рідко", ours: "Завжди" },
    { feature: "Миттєва перевірка", usual: false, ours: true },
    { feature: "Підтримка ментора", usual: "За графіком", ours: "24/7 підтримка" },
    { feature: "Ціна", usual: "$300 - $1000+", ours: "Доступно кожному" },
]

export default function Comparison() {
    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl font-extrabold text-center text-foreground mb-16 tracking-tight">Чому ми?</h2>

                    <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-8 text-lg font-bold text-foreground">Переваги</th>
                                    <th className="p-8 text-lg font-bold text-muted-foreground text-center">Звичайні курси</th>
                                    <th className="p-8 text-xl font-extrabold text-blue-600 text-center dark:text-blue-400">Playwright Platform</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {comparisons.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-8 font-bold text-foreground">{item.feature}</td>
                                        <td className="p-8 text-center text-muted-foreground">
                                            {typeof item.usual === "boolean" ? (
                                                <X className="h-6 w-6 text-red-500 mx-auto" />
                                            ) : item.usual}
                                        </td>
                                        <td className="p-8 text-center font-bold text-foreground">
                                            {typeof item.ours === "boolean" ? (
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                                                    <Check className="h-6 w-6 text-emerald-500" />
                                                </div>
                                            ) : item.ours}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
