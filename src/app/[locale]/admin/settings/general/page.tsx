"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Save, Loader2, Clock, Settings2, Globe, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"

export default function GeneralSettingsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [config, setConfig] = useState<Record<string, string>>({
        free_trial_days: "7",
        landing_languages: "true",
        landing_audience: "true",
        landing_how_it_works: "true",
        landing_setup: "true",
        landing_skills: "true",
        landing_curriculum: "true",
        landing_dashboard: "true",
        landing_why_playwright: "true",
        landing_cta: "true",
        landing_faq: "true",
        lang_uk: "true",
        lang_en: "true",
        lang_ru: "true",
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                setConfig(prev => ({ ...prev, ...data }))
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            })
            if (res.ok) {
                toast.success("Налаштування збережено!")
            } else {
                toast.error("Помилка збереження")
            }
        } catch (error) {
            toast.error("Помилка збереження")
        } finally {
            setIsSaving(false)
        }
    }

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }))
    }

    const toggleBool = (key: string) => {
        handleChange(key, config[key] === "true" ? "false" : "true")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-4xl pb-24">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings2 className="w-6 h-6 text-blue-600" />
                        Загальні налаштування
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Керування головною сторінкою, мовами та підпискою</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Зберегти
                </button>
            </div>

            {/* Trial Period */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Clock className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Пробний період</h3>
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                        Кількість безкоштовних днів для нових користувачів
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={config.free_trial_days}
                        onChange={(e) => handleChange("free_trial_days", e.target.value)}
                        className="w-full max-w-xs px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-400">Значення 0 означає, що пробного доступу немає.</p>
                </div>
            </div>

            {/* Languages */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Доступні мови (Локалізація)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { key: "lang_uk", label: "Українська (uk)", defaultReq: true },
                        { key: "lang_en", label: "English (en)", defaultReq: false },
                        { key: "lang_ru", label: "Русский (ru)", defaultReq: false },
                    ].map(lang => (
                        <label key={lang.key} className={`flex items-center space-x-3 cursor-pointer group p-4 rounded-2xl border transition-all ${config[lang.key] === "true" ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                            <input
                                type="checkbox"
                                disabled={lang.defaultReq} // uk should probably always be active, but let's let admin decide except for default
                                checked={config[lang.key] === "true"}
                                onChange={() => !lang.defaultReq && toggleBool(lang.key)}
                                className="h-5 w-5 rounded-md text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{lang.label}</span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Вибрані мови будуть доступні в перемикачі на сайті.</p>
            </div>

            {/* Landing Blocks */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <LayoutTemplate className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Блоки головної сторінки</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { key: "landing_languages", label: "Мови Playwright (LanguagesBlocks)" },
                        { key: "landing_audience", label: "Для кого підійде (TargetAudience)" },
                        { key: "landing_how_it_works", label: "Як це працює (HowItWorks)" },
                        { key: "landing_setup", label: "Швидкий старт (Setup)" },
                        { key: "landing_skills", label: "Що вивчите (Skills)" },
                        { key: "landing_curriculum", label: "Програма курсу (Curriculum)" },
                        { key: "landing_dashboard", label: "Кабінет студента (DashboardPreview)" },
                        { key: "landing_why_playwright", label: "Чому Playwright (WhyPlaywright)" },
                        { key: "landing_cta", label: "Блок реєстрації (CallToAction)" },
                        { key: "landing_faq", label: "Питання і відповіді (FAQ)" },
                    ].map(block => (
                        <label key={block.key} className="flex items-center justify-between cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">
                            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{block.label}</span>
                            <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config[block.key] === "true" ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={config[block.key] === "true"}
                                    onChange={() => toggleBool(block.key)}
                                />
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config[block.key] === "true" ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}
