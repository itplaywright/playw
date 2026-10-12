"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Terminal, Code2, Cpu } from "lucide-react"

export default function LanguagesBlocks() {
    const t = useTranslations('LanguagesBlocks')

    const languages = [
        {
            id: "typescript",
            name: "TypeScript",
            icon: <Terminal className="w-8 h-8" />,
            gradient: "from-blue-500 to-cyan-500",
            border: "border-blue-500/20 hover:border-blue-500/50",
            bg: "bg-blue-500/5",
            glow: "group-hover:shadow-blue-500/25",
        },
        {
            id: "python",
            name: "Python",
            icon: <Cpu className="w-8 h-8" />,
            gradient: "from-yellow-500 to-orange-500",
            border: "border-yellow-500/20 hover:border-yellow-500/50",
            bg: "bg-yellow-500/5",
            glow: "group-hover:shadow-yellow-500/25",
        },
        {
            id: "csharp",
            name: "C#",
            icon: <Code2 className="w-8 h-8" />,
            gradient: "from-purple-500 to-pink-500",
            border: "border-purple-500/20 hover:border-purple-500/50",
            bg: "bg-purple-500/5",
            glow: "group-hover:shadow-purple-500/25",
        }
    ]

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {languages.map((lang, idx) => (
                        <motion.div
                            key={lang.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                            whileHover={{ y: -8, scale: 1.03 }}
                            className={`group flex flex-col items-center justify-center p-8 rounded-3xl border ${lang.border} ${lang.bg} transition-all duration-300 shadow-sm hover:shadow-xl ${lang.glow}`}
                        >
                            <motion.div
                                whileHover={{ rotate: 12, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className={`mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${lang.gradient} flex items-center justify-center text-white shadow-lg`}
                            >
                                {lang.icon}
                            </motion.div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">
                                {lang.name}
                            </h3>
                            <p className="text-center text-muted-foreground">
                                {t(`desc_${lang.id}`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
