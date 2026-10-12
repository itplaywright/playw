"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

export default function CallToAction() {
    const t = useTranslations('CallToAction')

    return (
        <section className="py-32 relative overflow-hidden bg-background">
            {/* Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[130px] rounded-full -z-10 dark:bg-blue-600/10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10 dark:bg-purple-600/10" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl mx-auto glass rounded-[2.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden dark:glass-dark"
                >
                    {/* Inner glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

                    <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-10 tracking-tight leading-tight">
                        {t('title1')} <br className="hidden md:block" />
                        {t('title2')} <span className="text-gradient">{t('titleHighlight')}</span>
                    </h2>

                    <p className="text-muted-foreground text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href="/register"
                                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-12 text-xl font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)]"
                            >
                                <span>{t('cta')}</span>
                                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
