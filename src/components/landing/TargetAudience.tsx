"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function TargetAudience() {
    const t = useTranslations('TargetAudience')

    const audienceList = [
        { text: t('suitable1'), icon: CheckCircle2, color: "text-green-500" },
        { text: t('suitable2'), icon: CheckCircle2, color: "text-green-500" },
        { text: t('suitable3'), icon: CheckCircle2, color: "text-green-500" },
        { text: t('suitable4'), icon: CheckCircle2, color: "text-green-500" },
    ]

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-5xl"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-center text-foreground mb-16 tracking-tight">
                        {t('title')}
                    </h2>

                    <div className="grid gap-8 md:grid-cols-2 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%] w-px bg-gradient-to-b from-transparent via-border to-transparent z-0" />

                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="glass-card-premium-v2 rounded-[2.5rem] p-10 relative z-10 group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 className="w-24 h-24 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-inner">
                                    <span className="text-xl">✅</span>
                                </div>
                                {t('suitableTitle')}
                            </h3>
                            <ul className="space-y-6">
                                {audienceList.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                    >
                                        <item.icon className={`h-6 w-6 shrink-0 ${item.color} mt-0.5`} />
                                        <span className="text-foreground/80 font-medium text-lg leading-snug">{item.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="glass-card-premium-v2 rounded-[2.5rem] p-10 relative z-10 group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                                    <span className="text-xl">❌</span>
                                </div>
                                {t('notSuitableTitle')}
                            </h3>
                            <ul className="space-y-6">
                                <motion.li
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10"
                                >
                                    <XCircle className="h-6 w-6 shrink-0 text-red-500 mt-0.5" />
                                    <span className="text-foreground/80 font-medium text-lg leading-snug">{t('notSuitable1')}</span>
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10"
                                >
                                    <XCircle className="h-6 w-6 shrink-0 text-red-500 mt-0.5" />
                                    <span className="text-foreground/80 font-medium text-lg leading-snug">{t('notSuitable2')}</span>
                                </motion.li>
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
