"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

export default function FAQ() {
    const t = useTranslations('FAQ')
    const [openIdx, setOpenIdx] = useState<number | null>(null)

    const faqs = [
        { q: t('q1'), a: t('a1') },
        { q: t('q2'), a: t('a2') },
        { q: t('q3'), a: t('a3') },
        { q: t('q4'), a: t('a4') },
        { q: t('q5'), a: t('a5') },
        { q: t('q6'), a: t('a6') },
        { q: t('q7'), a: t('a7') },
        { q: t('q8'), a: t('a8') },
    ]

    return (
        <section id="faq" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-4xl font-extrabold text-center text-foreground mb-16 tracking-tight"
                >
                    {t('title')}
                </motion.h2>
                <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08, duration: 0.5 }}
                            className="rounded-3xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
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
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
