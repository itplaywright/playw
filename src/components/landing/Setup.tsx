"use client"

import { motion } from "framer-motion"
import { Download, Laptop, Terminal, Chrome } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Setup() {
    const t = useTranslations('Setup')

    const setupSteps = [
        {
            title: t('step1_title'), desc: t('step1_desc'), icon: Download, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20",
            link: "https://nodejs.org/", linkText: t('step1_link')
        },
        {
            title: t('step2_title'), desc: t('step2_desc'), icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20",
            link: "https://code.visualstudio.com/", linkText: t('step2_link')
        },
        { title: t('step3_title'), desc: t('step3_desc'), icon: Chrome, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
        {
            title: t('step4_title'), desc: t('step4_desc'), icon: Terminal, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20",
            code: "npm init playwright@latest"
        },
    ]

    return (
        <section id="setup" className="py-32 bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">{t('subtitle')}</p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting dashed line for steps */}
                    <div className="hidden lg:block absolute top-[4.5rem] bottom-0 left-[2.75rem] w-px border-l-2 border-dashed border-border z-0" />

                    <div className="space-y-12">
                        {setupSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.6, type: "spring", stiffness: 80 }}
                                className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 group"
                            >
                                {/* Step Indicator */}
                                <div className="flex items-start lg:items-center gap-6 lg:w-1/3">
                                    <div className="relative">
                                        <div className={`flex-shrink-0 h-24 w-24 rounded-3xl ${step.bg} border flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-500`}>
                                            <step.icon className={`h-10 w-10 ${step.color}`} />
                                        </div>
                                        <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center font-bold text-sm text-foreground shadow-sm group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mt-4 lg:mt-0">{step.title}</h3>
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 lg:pt-4">
                                    <div className="glass-card-premium-v2 rounded-3xl p-8 group-hover:border-border/80 transition-colors">
                                        <p className="text-foreground/80 text-lg leading-relaxed mb-6">{step.desc}</p>

                                        {step.link && (
                                            <a
                                                href={step.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                                            >
                                                {step.linkText}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}

                                        {step.code && (
                                            <div className="bg-black/80 dark:bg-black/50 p-5 rounded-2xl border border-border flex items-center justify-between">
                                                <code className="text-blue-400 font-mono text-base">{step.code}</code>
                                                <div className="px-2 py-1 bg-white/10 rounded text-xs text-white/50 uppercase tracking-widest font-bold">Terminal</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-24 flex justify-center"
                >
                    <div className="flex items-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-lg shadow-emerald-500/5">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{t('ready')}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
