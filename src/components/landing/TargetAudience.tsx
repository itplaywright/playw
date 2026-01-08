"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

const audienceList = [
    { text: "Manual QA, які хочуть в автоматизацію", icon: CheckCircle2, color: "text-green-500" },
    { text: "Junior / Middle QA", icon: CheckCircle2, color: "text-green-500" },
    { text: "Ті, хто знає теорію, але не писав автотести з нуля", icon: CheckCircle2, color: "text-green-500" },
    { text: "Хто готується до співбесіди AQA", icon: CheckCircle2, color: "text-green-500" },
]

export default function TargetAudience() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl"
                >
                    <h2 className="text-4xl font-bold text-center text-foreground mb-16 tracking-tight">
                        Для кого ця платформа
                    </h2>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-green-500/10 text-green-500">✅</span>
                                Кому підійде
                            </h3>
                            <ul className="space-y-5">
                                {audienceList.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <item.icon className={`h-6 w-6 shrink-0 ${item.color}`} />
                                        <span className="text-muted-foreground">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-red-500/10 text-red-500">❌</span>
                                Не для тебе, якщо
                            </h3>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-3">
                                    <XCircle className="h-6 w-6 shrink-0 text-red-500" />
                                    <span className="text-muted-foreground">Ти шукаєш "просто подивитись відео"</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="h-6 w-6 shrink-0 text-red-500" />
                                    <span className="text-muted-foreground">Не готовий писати код самостійно</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
