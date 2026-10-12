"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

const skillsList = [
    "Locators & Selectors",
    "Actions & Assertions",
    "Page Object Model",
    "API Testing",
    "Parallel Execution",
    "Visual Testing",
    "Network Interception",
    "Authentication Flows",
]

export default function Skills() {
    const t = useTranslations('Skills')

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-extrabold text-center text-foreground mb-12 tracking-tight"
                >
                    {t('title')}
                </motion.h2>
                <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                    {skillsList.map((skill, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.07, duration: 0.5, type: "spring", stiffness: 120 }}
                            whileHover={{ scale: 1.08, y: -4 }}
                            className="px-8 py-4 rounded-2xl bg-muted/50 border border-border text-foreground font-bold text-lg hover:border-blue-500/50 hover:bg-card transition-all cursor-default shadow-sm hover:shadow-lg"
                        >
                            {skill}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
