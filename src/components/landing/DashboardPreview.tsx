"use client"

import { motion } from "framer-motion"
import { BarChart3, CheckCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

export default function DashboardPreview() {
    const t = useTranslations('DashboardPreview')

    return (
        <section className="py-24 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:w-1/2"
                    >
                        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 mb-6 dark:text-blue-400">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>{t('badge')}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-foreground mb-8 tracking-tight">{t('title')}</h2>
                        <ul className="space-y-8">
                            <motion.li
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-start gap-5"
                            >
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                    <span className="text-green-500 font-bold text-lg">%</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">{t('feature1_title')}</h4>
                                    <p className="text-muted-foreground">{t('feature1_desc')}</p>
                                </div>
                            </motion.li>
                            <motion.li
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex items-start gap-5"
                            >
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">{t('feature2_title')}</h4>
                                    <p className="text-muted-foreground">{t('feature2_desc')}</p>
                                </div>
                            </motion.li>
                            <motion.li
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="flex items-start gap-5"
                            >
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <RotateCcw className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-1">{t('feature3_title')}</h4>
                                    <p className="text-muted-foreground">{t('feature3_desc')}</p>
                                </div>
                            </motion.li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 60, rotateY: 10 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative z-10 glass rounded-[2.5rem] p-10 shadow-2xl dark:glass-dark">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-foreground font-bold text-2xl">{t('dashboardTitle')}</h3>
                                <span className="text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/20">{t('level')}</span>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-muted-foreground font-medium">{t('overallProgress')}</span>
                                        <span className="text-foreground font-bold">67%</span>
                                    </div>
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: "67%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                                        className="bg-muted/50 p-6 rounded-[2rem] border border-border"
                                    >
                                        <span className="text-5xl font-extrabold text-foreground">12</span>
                                        <p className="text-muted-foreground font-medium mt-2">{t('tasksCompleted')}</p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                                        className="bg-muted/50 p-6 rounded-[2rem] border border-border"
                                    >
                                        <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">35</span>
                                        <p className="text-muted-foreground font-medium mt-2">{t('codeAttempts')}</p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10 dark:bg-blue-600/20" />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 dark:bg-purple-600/20" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
