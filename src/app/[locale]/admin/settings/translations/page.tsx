"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Save, Loader2, Globe, Search } from "lucide-react"
import { toast } from "sonner"

export default function TranslationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [locale, setLocale] = useState("uk")
    
    const [defaults, setDefaults] = useState<Record<string, string>>({})
    const [overrides, setOverrides] = useState<Record<string, string>>({})
    const [search, setSearch] = useState("")

    useEffect(() => {
        loadData()
    }, [locale])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [defRes, dbRes] = await Promise.all([
                fetch(`/api/admin/translations/defaults?locale=${locale}`),
                fetch(`/api/admin/translations?locale=${locale}`)
            ])
            
            if (defRes.ok) setDefaults(await defRes.json())
            if (dbRes.ok) setOverrides(await dbRes.json())
        } catch (error) {
            console.error("Error loading translations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (key: string, value: string) => {
        setOverrides(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async (key: string) => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    locale,
                    key,
                    value: overrides[key] || defaults[key]
                })
            })
            if (res.ok) {
                toast.success("Текст збережено")
            } else {
                toast.error("Помилка збереження")
            }
        } catch (error) {
            toast.error("Помилка збереження")
        } finally {
            setIsSaving(false)
        }
    }

    const filteredKeys = Object.keys(defaults).filter(k => 
        k.toLowerCase().includes(search.toLowerCase()) || 
        defaults[k].toLowerCase().includes(search.toLowerCase()) ||
        (overrides[k] && overrides[k].toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6 max-w-5xl pb-24">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-600" />
                        Тексти сайту
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Редагування заголовків та текстів головної сторінки</p>
                </div>
                
                <div className="flex gap-2">
                    {["uk", "en", "ru"].map(l => (
                        <button
                            key={l}
                            onClick={() => setLocale(l)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${locale === l ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Пошук по ключу або тексту..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:text-gray-400"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredKeys.map(key => (
                        <div key={key} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 group transition-all hover:shadow-md hover:border-blue-100">
                            <div className="text-xs font-mono text-gray-400 font-bold bg-gray-50 self-start px-2 py-1 rounded">{key}</div>
                            
                            <div className="flex items-start gap-4">
                                <textarea
                                    value={overrides[key] ?? defaults[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className="flex-1 min-h-[60px] p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y text-gray-900 font-medium"
                                />
                                <button
                                    onClick={() => handleSave(key)}
                                    disabled={isSaving || (overrides[key] === undefined && overrides[key] === defaults[key])}
                                    className="flex-shrink-0 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {filteredKeys.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Нічого не знайдено
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
