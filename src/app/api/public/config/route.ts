import { NextResponse } from "next/server"
import { db } from "@/db"
import { settings, menuItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export async function GET() {
    try {
        // 1. Fetch settings
        const settingsData = await db.select().from(settings)

        // Convert array [{key: 'k', value: 'v'}] to object {k: v}
        const settingsMap = settingsData.reduce((acc, item) => {
            acc[item.key] = item.value
            return acc
        }, {} as Record<string, string | null>)

        // Defaults if DB is empty
        const finalSettings = {
            header_platform_name: settingsMap.header_platform_name ?? "Playwright Platform",
            header_theme: settingsMap.header_theme ?? "dark",
            header_visible: settingsMap.header_visible ?? "true",
            header_logo_url: settingsMap.header_logo_url ?? null,
            available_themes: settingsMap.available_themes ?? "light,dark,system",
            lang_uk: settingsMap.lang_uk ?? "true",
            lang_en: settingsMap.lang_en ?? "true",
            lang_ru: settingsMap.lang_ru ?? "true",
            // Footer settings
            footer_desc_uk: settingsMap.footer_desc_uk ?? "",
            footer_desc_en: settingsMap.footer_desc_en ?? "",
            footer_desc_ru: settingsMap.footer_desc_ru ?? "",
            footer_email: settingsMap.footer_email ?? "docs@itplatform.com",
            footer_telegram: settingsMap.footer_telegram ?? "https://t.me/playwrightfortestbot",
            footer_github: settingsMap.footer_github ?? "",
            footer_twitter: settingsMap.footer_twitter ?? "",
        }

        // 2. Fetch menu items (with localized titles)
        const menuData = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.isVisible, true))
            .orderBy(asc(menuItems.order))

        // Fallback menu if DB is empty
        const finalMenu = menuData.length > 0 ? menuData.map(item => ({
            id: item.id,
            title: item.title,
            titleEn: item.titleEn || item.title,
            titleRu: item.titleRu || item.title,
            url: item.url,
            type: item.type,
            isVisible: item.isVisible,
        })) : [
            { id: 1, title: "Програма", titleEn: "Curriculum", titleRu: "Программа", url: "#curriculum", type: "internal", isVisible: true },
            { id: 2, title: "Як це працює", titleEn: "How it works", titleRu: "Как это работает", url: "#how-it-works", type: "internal", isVisible: true },
            { id: 3, title: "FAQ", titleEn: "FAQ", titleRu: "FAQ", url: "#faq", type: "internal", isVisible: true },
        ]

        return NextResponse.json({
            settings: finalSettings,
            menu: finalMenu,
        })
    } catch (error) {
        console.error("Config API Error:", error)
        return NextResponse.json({ error: "Failed to load config" }, { status: 500 })
    }
}
