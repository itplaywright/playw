"use client"

import { motion } from "framer-motion"
import { Zap, Globe, Cpu } from "lucide-react"
import { useTranslations } from "next-intl"

export default function WhyPlaywright() {
    const t = useTranslations('WhyPlaywright')

    const features = [
        { icon: Globe, title: t('feature1_title'), desc: t('feature1_desc'), color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20" },
        { icon: Zap, title: t('feature2_title'), desc: t('feature2_desc'), color: "from-amber-400 to-orange-500", shadow: "shadow-orange-500/20" },
        { icon: Cpu, title: t('feature3_title'), desc: t('feature3_desc'), color: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/20" },
    ]

    return (
        <section className="py-32 relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-20" />
            
            {/* Hexagon/Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] -z-10" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83V0h58.34zM29.585 27.275l-4.142 4.142v5.828l4.142 4.142h5.828l4.142-4.142v-5.828l-4.142-4.142h-5.828zM30.415 28.1l3.313 3.313v4.686l-3.313 3.314h-4.686l-3.314-3.314v-4.686l3.314-3.313h4.686zM46.732 10.118l-4.142 4.142v5.828l4.142 4.142h5.828l4.142-4.142v-5.828l-4.142-4.142h-5.828zm.83 1.17l3.313 3.313v4.686l-3.313 3.314h-4.686l-3.314-3.314v-4.686l3.314-3.313h4.686zM12.43 10.118l-4.142 4.142v5.828l4.142 4.142h5.828l4.142-4.142v-5.828l-4.142-4.142h-5.828zm.83 1.17l3.313 3.313v4.686l-3.313 3.314h-4.686l-3.314-3.314v-4.686l3.314-3.313h4.686z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")` }} 
            />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">{t('subtitle')}</p>
                </motion.div>

                <div className="grid gap-10 md:grid-cols-3 max-w-6xl mx-auto">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.7, type: "spring", stiffness: 80 }}
                            className="glass-card-premium-v2 rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className="relative mb-8">
                                {/* Glow behind icon */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 rounded-full`} />
                                
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className={`relative h-24 w-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-xl ${feature.shadow} z-10 overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-shine" />
                                    <feature.icon className="h-10 w-10 relative z-10" />
                                </motion.div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                            <p className="text-foreground/70 leading-relaxed text-lg">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
