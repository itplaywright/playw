"use client"

import { motion } from "framer-motion"
import { Zap, Globe, Cpu } from "lucide-react"

const features = [
    {
        icon: Globe,
        title: "Сучасний стандарт",
        desc: "Playwright стає де-факто стандартом в індустрії, витісняючи старі інструменти."
    },
    {
        icon: Zap,
        title: "Швидкий і стабільний",
        desc: "Архітектура, яка усуває проблему 'flaky' тестів та чекання елементів."
    },
    {
        icon: Cpu,
        title: "TypeScript = must-have",
        desc: "Строга типізація допомагає писати надійніший код та швидше знаходити помилки."
    }
]

export default function WhyPlaywright() {
    return (
        <section className="py-32 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-blue-600/5 skew-y-3 transform origin-bottom-right -z-10" />
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">Чому Playwright + TypeScript?</h2>
                    <p className="text-muted-foreground text-lg">Вибір топ-компаній світу</p>
                </motion.div>

                <div className="grid gap-10 md:grid-cols-3">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-card border border-border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
                        >
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <feature.icon className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
