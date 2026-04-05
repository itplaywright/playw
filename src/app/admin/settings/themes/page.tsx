"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, CheckCircle2, Save, Loader2, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function ThemeSettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [enabledThemes, setEnabledThemes] = useState<string[]>(["light", "dark", "system"])

    useEffect(() => {
        setMounted(true)
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                if (data.available_themes) {
                    setEnabledThemes(data.available_themes.split(","))
                }
            }
        } catch (error) {
            console.error("Error loading theme settings:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (enabledThemes.length === 0) {
            toast.error("Хоча б одна тема має бути увімкнена")
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ available_themes: enabledThemes.join(",") })
            })
            if (res.ok) {
                toast.success("Налаштування видимості тем збережено!")
            } else {
                toast.error("Помилка збереження")
            }
        } catch (error) {
            toast.error("Помилка збереження")
        } finally {
            setIsSaving(false)
        }
    }

    const toggleThemeVisibility = (id: string) => {
        if (enabledThemes.includes(id)) {
            if (enabledThemes.length <= 1) {
                toast.error("Ви не можете вимкнути останню доступну тему")
                return
            }
            setEnabledThemes(enabledThemes.filter(t => t !== id))
        } else {
            setEnabledThemes([...enabledThemes, id])
        }
    }

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Monitor className="w-8 h-8 text-blue-600" />
                        Керування темами
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 font-black uppercase tracking-widest opacity-70">
                        Налаштування доступності та видимості тем для користувачів
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Зберегти
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-20" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {themeOptions.map((option) => {
                        const isEnabled = enabledThemes.includes(option.id)
                        const isActive = theme === option.id
                        
                        return (
                            <div key={option.id} className="space-y-4">
                                <motion.button
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setTheme(option.id)}
                                    className={`w-full relative text-left p-6 rounded-[2rem] border-2 transition-all duration-300 bg-card ${
                                        isActive 
                                            ? "border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5" 
                                            : "border-border hover:border-border/80 shadow-md"
                                    } ${!isEnabled ? "opacity-50 grayscale" : ""}`}
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
                                            {isActive && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-black uppercase tracking-wider leading-relaxed opacity-60">
                                            {option.description}
                                        </p>
                                    </div>
                                </motion.button>

                                {/* Visibility Toggle */}
                                <button
                                    onClick={() => toggleThemeVisibility(option.id)}
                                    className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-[0.15em] ${
                                        isEnabled 
                                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" 
                                            : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {isEnabled ? "Увімкнено" : "Вимкнено"}
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                                        <motion.div 
                                            animate={{ x: isEnabled ? 18 : 2 }}
                                            className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" 
                                        />
                                    </div>
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Hint Box */}
            <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Керування видимістю</h4>
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-tight leading-relaxed opacity-70">
                        Вимкнені теми не будуть відображатися у перемикачі тем на всьому сайті. Якщо ви вимкнете тему, якою зараз користується відвідувач, система автоматично запропонує альтернативну доступну тему.
                    </p>
                </div>
            </div>
        </div>
    )
}
