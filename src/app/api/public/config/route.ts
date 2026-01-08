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
            header_logo_url: settingsMap.header_logo_url ?? null, // From admin
        }

        // 2. Fetch menu items
        const menuData = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.isVisible, true))
            .orderBy(asc(menuItems.order))

        // Fallback menu if DB is empty
        const finalMenu = menuData.length > 0 ? menuData : [
            {
                id: 1,
                title: "Програма",
                url: "#curriculum",
                type: "internal",
                isVisible: true,
            },
            {
                id: 2,
                title: "Як це працює",
                url: "#how-it-works",
                type: "internal",
                isVisible: true,
            },
            {
                id: 3,
                title: "FAQ",
                url: "#faq",
                type: "internal",
                isVisible: true,
            },
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
