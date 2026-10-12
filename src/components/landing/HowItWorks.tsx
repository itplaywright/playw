"use client"

import { motion } from "framer-motion"
import { Code2, Play, Search, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"

export default function HowItWorks() {
    const t = useTranslations('HowItWorks')

    const steps = [
        { title: t('step1_title'), desc: t('step1_desc'), icon: Search, color: "bg-blue-500" },
        { title: t('step2_title'), desc: t('step2_desc'), icon: Code2, color: "bg-purple-500" },
        { title: t('step3_title'), desc: t('step3_desc'), icon: Play, color: "bg-emerald-500" },
        { title: t('step4_title'), desc: t('step4_desc'), icon: GraduationCap, color: "bg-amber-500" },
    ]

    return (
        <section id="how-it-works" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                            className="relative group h-full"
                        >
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-[calc(100%-20px)] w-full h-[2px] bg-gradient-to-r from-border to-transparent z-0" />
                            )}

                            <div className="relative h-full flex flex-col items-center p-8 rounded-[2.5rem] bg-card border border-border shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 z-10">
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className={`h-16 w-16 rounded-2xl ${step.color} flex items-center justify-center text-white mb-8 shadow-lg`}
                                >
                                    <step.icon className="h-8 w-8" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                                <p className="text-muted-foreground text-center leading-relaxed">{step.desc}</p>

                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-border flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
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
