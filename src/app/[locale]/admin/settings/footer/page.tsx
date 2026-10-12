"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Link as LinkIcon, Mail, Github, Twitter, MessageSquare, Text } from "lucide-react"
import { toast } from "sonner"

export default function FooterSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState({
        footer_desc_uk: "",
        footer_desc_en: "",
        footer_desc_ru: "",
        footer_email: "",
        footer_telegram: "",
        footer_github: "",
        footer_twitter: ""
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                setSettings(prev => ({ ...prev, ...data }))
            }
        } catch (error) {
            console.error("Error loading footer settings:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const promises = Object.entries(settings).map(([key, value]) =>
                fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value })
                })
            )
            await Promise.all(promises)
            toast.success("Налаштування футера збережено")
        } catch (error) {
            toast.error("Помилка збереження")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Налаштування футера</h1>
                <p className="text-sm text-gray-500 mt-1">Опис бренду та посилання на соцмережі/контакти</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Brand Descriptions */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Text className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Короткий опис платформи</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">🇺🇦 Опис (Укр)</label>
                            <textarea
                                rows={2}
                                value={settings.footer_desc_uk || ""}
                                onChange={(e) => setSettings({ ...settings, footer_desc_uk: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="Професійна платформа для вивчення..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">🇬🇧 Опис (Eng)</label>
                            <textarea
                                rows={2}
                                value={settings.footer_desc_en || ""}
                                onChange={(e) => setSettings({ ...settings, footer_desc_en: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">🇷🇺 Опис (Рос)</label>
                            <textarea
                                rows={2}
                                value={settings.footer_desc_ru || ""}
                                onChange={(e) => setSettings({ ...settings, footer_desc_ru: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links & Contacts */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Контакти та Соцмережі</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Mail className="w-3.5 h-3.5" />
                                Email підтримки
                            </label>
                            <input
                                type="email"
                                value={settings.footer_email || ""}
                                onChange={(e) => setSettings({ ...settings, footer_email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="docs@itplatform.com"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Telegram (Бот/Канал)
                            </label>
                            <input
                                type="url"
                                value={settings.footer_telegram || ""}
                                onChange={(e) => setSettings({ ...settings, footer_telegram: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="https://t.me/..."
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Github className="w-3.5 h-3.5" />
                                GitHub
                            </label>
                            <input
                                type="url"
                                value={settings.footer_github || ""}
                                onChange={(e) => setSettings({ ...settings, footer_github: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Twitter className="w-3.5 h-3.5" />
                                Twitter (X)
                            </label>
                            <input
                                type="url"
                                value={settings.footer_twitter || ""}
                                onChange={(e) => setSettings({ ...settings, footer_twitter: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-gray-900"
                                placeholder="https://x.com/..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        Зберегти зміни
                    </button>
                </div>
            </form>
        </div>
    )
}
