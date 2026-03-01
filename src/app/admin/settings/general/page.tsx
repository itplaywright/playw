"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Clock, Settings2 } from "lucide-react"
import { toast } from "sonner"

export default function GeneralSettingsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [freeTrialDays, setFreeTrialDays] = useState("7")

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                setFreeTrialDays(data.free_trial_days ?? "7")
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
                body: JSON.stringify({ free_trial_days: freeTrialDays })
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings2 className="w-6 h-6 text-blue-600" />
                        Загальні налаштування
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Глобальні параметри платформи для нових користувачів</p>
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
                        value={freeTrialDays}
                        onChange={(e) => setFreeTrialDays(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="7"
                    />
                    <p className="text-xs text-gray-400 flex items-start gap-1.5">
                        <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        Після закінчення цього строку та якщо у користувача немає активного тарифу, його буде перенаправлено на сторінку вибору тарифу. Значення 0 означає, що пробного доступу немає.
                    </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-sm text-amber-700 font-medium">
                        ⚠️ Поточне значення: <span className="font-black">{freeTrialDays} днів</span> безкоштовного доступу після реєстрації.
                    </p>
                </div>
            </div>
        </div>
    )
}
