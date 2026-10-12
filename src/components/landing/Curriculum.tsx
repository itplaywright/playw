"use client"

import { motion } from "framer-motion"
import { ChevronRight, Target, Layout, Database, Terminal } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Curriculum() {
    const t = useTranslations('Curriculum')

    const modules = [
        {
            title: t('module1_title'), icon: Terminal,
            topics: [t('module1_topic1'), t('module1_topic2'), t('module1_topic3'), t('module1_topic4')],
            color: "text-blue-500"
        },
        {
            title: t('module2_title'), icon: Layout,
            topics: [t('module2_topic1'), t('module2_topic2'), t('module2_topic3'), t('module2_topic4')],
            color: "text-purple-500"
        },
        {
            title: t('module3_title'), icon: Target,
            topics: [t('module3_topic1'), t('module3_topic2'), t('module3_topic3'), t('module3_topic4')],
            color: "text-pink-500"
        },
        {
            title: t('module4_title'), icon: Database,
            topics: [t('module4_topic1'), t('module4_topic2'), t('module4_topic3'), t('module4_topic4')],
            color: "text-emerald-500"
        }
    ]

    return (
        <section id="curriculum" className="py-32 bg-muted/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">{t('subtitle')}</p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                    {modules.map((module, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.12, duration: 0.6, type: "spring", stiffness: 80 }}
                            whileHover={{ y: -6 }}
                            className="bg-card border border-border rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 8 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className={`h-16 w-16 rounded-2xl bg-muted/50 ${module.color} flex items-center justify-center shadow-sm`}
                                >
                                    <module.icon className="h-8 w-8" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-foreground">{module.title}</h3>
                            </div>

                            <ul className="space-y-4">
                                {module.topics.map((topic, tIdx) => (
                                    <motion.li
                                        key={tIdx}
                                        initial={{ opacity: 0, x: -15 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + tIdx * 0.08, duration: 0.4 }}
                                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ChevronRight className={`h-5 w-5 ${module.color} shrink-0`} />
                                        <span className="font-medium">{topic}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
