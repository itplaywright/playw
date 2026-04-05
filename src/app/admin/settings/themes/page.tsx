"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function ThemeSettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const themeOptions = [
        {
            id: "light",
            name: "Світла",
            description: "Класичний світлий інтерфейс для денної роботи",
            icon: Sun,
            color: "text-amber-500",
            bg: "bg-white",
            border: "border-gray-200"
        },
        {
            id: "dark",
            name: "Темна",
            description: "Комфортний темний режим для вечірнього часу",
            icon: Moon,
            color: "text-blue-400",
            bg: "bg-slate-900",
            border: "border-slate-800"
        },
        {
            id: "system",
            name: "Системна",
            description: "Автоматичне перемикання згідно з налаштуваннями ОС",
            icon: Monitor,
            color: "text-purple-500",
            bg: "bg-gradient-to-br from-white to-slate-900",
            border: "border-gray-300"
        }
    ]

    return (
        <div className="space-y-10 max-w-4xl">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-blue-600" />
                    Керування темами
                </h1>
                <p className="text-sm text-muted-foreground mt-2 font-black uppercase tracking-widest opacity-70">
                    Персоналізація адміністративного інтерфейсу та вибір стилів
                </p>
            </div>

            {/* Theme Selection Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {themeOptions.map((option) => {
                    const isActive = theme === option.id
                    return (
                        <motion.button
                            key={option.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme(option.id)}
                            className={`relative text-left p-6 rounded-[2rem] border-2 transition-all duration-300 bg-card ${
                                isActive 
                                    ? "border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5" 
                                    : "border-border hover:border-border/80 shadow-md"
                            }`}
                        >
                            {/* Theme Badge Wrapper */}
                            <div className={`w-14 h-14 rounded-2xl ${option.bg} border ${option.border} flex items-center justify-center mb-6 shadow-inner relative overflow-hidden`}>
                                <option.icon className={`w-7 h-7 ${option.color} relative z-10`} />
                                {option.id === "system" && (
                                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-foreground tracking-tight flex items-center justify-between">
                                    {option.name}
                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        </motion.div>
                                    )}
                                </h3>
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-wider leading-relaxed opacity-60">
                                    {option.description}
                                </p>
                            </div>

                            {/* Active Indicator Bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-bar"
                                    className="absolute bottom-0 left-10 right-10 h-1 bg-blue-600 rounded-t-full"
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Hint Box */}
            <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Інформація</h4>
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-tight leading-relaxed opacity-70">
                        Ваші налаштування автоматично зберігаються та застосовуються до всієї платформи. Ви також можете миттєво перемикати тему за допомогою іконки у верхній панелі адмінки.
                    </p>
                </div>
            </div>
        </div>
    )
}
