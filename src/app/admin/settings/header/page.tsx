"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Save,
    Upload,
    Image as ImageIcon,
    Sun,
    Moon,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2
} from "lucide-react"

export default function HeaderSettingsPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const [settings, setSettings] = useState({
        header_logo_url: "",
        header_platform_name: "Playwright Platform",
        header_theme: "light",
        header_visible: "true"
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
                setSettings({
                    header_logo_url: data.header_logo_url || "",
                    header_platform_name: data.header_platform_name || "Playwright Platform",
                    header_theme: data.header_theme || "light",
                    header_visible: data.header_visible || "true"
                })
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingLogo(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setSettings({ ...settings, header_logo_url: data.url })
            } else {
                const error = await res.json()
                alert(error.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload failed")
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                alert("Налаштування збережено!")
                router.refresh()
            }
        } catch (error) {
            console.error("Save error:", error)
            alert("Помилка збереження")
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
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Налаштування Header</h1>
                    <p className="text-sm text-gray-500 mt-1">Керуйте зовнішнім виглядом шапки сайту</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-2 text-purple-600 mb-2">
                        <ImageIcon className="h-5 w-5" />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Логотип</h3>
                    </div>

                    <div className="space-y-4">
                        {settings.header_logo_url && (
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <img
                                    src={settings.header_logo_url}
                                    alt="Logo preview"
                                    className="max-h-24 mx-auto object-contain"
                                />
                            </div>
                        )}

                        <label className="block">
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.svg"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-all cursor-pointer border-2 border-blue-100">
                                {uploadingLogo ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Upload className="mr-2 h-5 w-5" />
                                )}
                                {uploadingLogo ? "Завантаження..." : "Завантажити логотип"}
                            </div>
                        </label>

                        <p className="text-xs text-gray-500 text-center">
                            PNG, JPG або SVG. Максимум 2MB
                        </p>
                    </div>
                </div>

                {/* Platform Name */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-2 text-green-600 mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Назва платформи</h3>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={settings.header_platform_name}
                            onChange={(e) => setSettings({ ...settings, header_platform_name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-lg"
                            placeholder="Наприклад: Playwright Platform"
                        />
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-2 text-orange-600 mb-2">
                        <Sun className="h-5 w-5" />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Тема</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSettings({ ...settings, header_theme: "light" })}
                            className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-center ${settings.header_theme === "light"
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                }`}
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            Світла
                        </button>
                        <button
                            type="button"
                            onClick={() => setSettings({ ...settings, header_theme: "dark" })}
                            className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-center ${settings.header_theme === "dark"
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                }`}
                        >
                            <Moon className="mr-2 h-4 w-4" />
                            Темна
                        </button>
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Eye className="h-5 w-5" />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Видимість</h3>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">Показувати Header</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={settings.header_visible === "true"}
                                onChange={(e) => setSettings({ ...settings, header_visible: e.target.checked ? "true" : "false" })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}
