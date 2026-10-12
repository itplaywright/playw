"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Terminal, Code2, Cpu } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-background min-h-[90vh] flex items-center">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20" />
            
            {/* Background animated gradients */}
            <div className="absolute top-0 left-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[130px] animate-pulse dark:bg-blue-600/30" />
            <div className="absolute top-1/2 right-0 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px] dark:bg-purple-600/30" />
            
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="mb-8 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 backdrop-blur-md shadow-lg shadow-blue-500/10 dark:text-blue-400"
                        >
                            <span className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                </span>
                                {t('badge')}
                            </span>
                        </motion.div>

                        <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.1] lg:leading-[1.1]">
                            {t('title1')} <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                                {t('titleHighlight')}
                            </span> <br className="hidden md:block"/>
                            {t('title2')}
                        </h1>

                        <p className="mx-auto lg:mx-0 mb-12 max-w-2xl text-xl text-muted-foreground sm:text-2xl leading-relaxed">
                            {t('description')}
                        </p>

                        <div className="flex flex-col items-center lg:items-start justify-center lg:justify-start gap-6 sm:flex-row">
                            <Link
                                href="/register"
                                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] active:scale-95"
                            >
                                <span className="relative z-10">{t('startLearning')}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
                            </Link>

                            <Link
                                href="#curriculum"
                                className="group inline-flex h-14 items-center justify-center rounded-2xl border-2 border-border bg-background px-10 text-lg font-bold text-foreground transition-all hover:border-blue-500/50 hover:bg-muted/50 active:scale-95"
                            >
                                {t('curriculum')}
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual/3D Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 w-full max-w-2xl lg:max-w-none perspective-1000"
                    >
                        <div className="relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl p-2 transform-gpu hover:-rotate-1 hover:scale-[1.02] transition-all duration-500">
                            {/* Browser Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 mb-4 bg-muted/30 rounded-t-xl">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mx-auto bg-background/50 text-muted-foreground text-xs font-mono px-4 py-1 rounded-md border border-border/50 flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    playwright.config.ts
                                </div>
                            </div>
                            
                            {/* Code snippet */}
                            <div className="p-4 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto text-left">
                                <div className="flex">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">1</span>
                                    <span className="text-purple-500 dark:text-purple-400">import</span> <span className="text-foreground">{" { "}</span> <span className="text-blue-500 dark:text-blue-400">test</span><span className="text-foreground">, </span><span className="text-blue-500 dark:text-blue-400">expect</span> <span className="text-foreground">{" } "}</span> <span className="text-purple-500 dark:text-purple-400">from</span> <span className="text-green-600 dark:text-green-400">'@playwright/test'</span><span className="text-foreground">;</span>
                                </div>
                                <div className="flex mt-2">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">2</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">3</span>
                                    <span className="text-blue-500 dark:text-blue-400">test</span><span className="text-foreground">(</span><span className="text-green-600 dark:text-green-400">'has title'</span><span className="text-foreground">, </span><span className="text-purple-500 dark:text-purple-400">async</span> <span className="text-foreground">{"({ "}</span> <span className="text-orange-500 dark:text-orange-400">page</span> <span className="text-foreground">{" }) => {"}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">4</span>
                                    <span className="pl-8 text-purple-500 dark:text-purple-400">await</span> <span className="text-orange-500 dark:text-orange-400">page</span><span className="text-foreground">.</span><span className="text-blue-500 dark:text-blue-400">goto</span><span className="text-foreground">(</span><span className="text-green-600 dark:text-green-400">'https://itplatform.com'</span><span className="text-foreground">);</span>
                                </div>
                                <div className="flex mt-2">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">5</span>
                                    <span className="pl-8 text-muted-foreground italic">// Expect a title "to contain" a substring.</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">6</span>
                                    <span className="pl-8 text-purple-500 dark:text-purple-400">await</span> <span className="text-blue-500 dark:text-blue-400">expect</span><span className="text-foreground">(</span><span className="text-orange-500 dark:text-orange-400">page</span><span className="text-foreground">).</span><span className="text-blue-500 dark:text-blue-400">toHaveTitle</span><span className="text-foreground">(</span><span className="text-yellow-600 dark:text-yellow-400">/Playwright/</span><span className="text-foreground">);</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">7</span>
                                    <span className="text-foreground">{"});"}</span>
                                </div>
                                
                                {/* Animated typing cursor */}
                                <div className="flex mt-2">
                                    <span className="text-muted-foreground select-none w-8 text-right pr-4">8</span>
                                    <motion.span 
                                        animate={{ opacity: [1, 0] }} 
                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                        className="w-2.5 h-5 bg-blue-500 ml-1"
                                    />
                                </div>
                            </div>
                            
                            {/* Floating decorative elements */}
                            <motion.div 
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -right-12 -top-12 h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-12 hidden md:flex"
                            >
                                <Terminal className="text-white w-10 h-10" />
                            </motion.div>
                            
                            <motion.div 
                                animate={{ y: [10, -10, 10] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute -left-8 -bottom-8 h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 -rotate-12 hidden md:flex"
                            >
                                <Code2 className="text-white w-8 h-8" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
