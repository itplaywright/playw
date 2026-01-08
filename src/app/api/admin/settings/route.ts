import { auth } from "@/lib/auth"
import { db } from "@/db"
import { settings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allSettings = await db.select().from(settings)

    // Convert to key-value object for easier consumption
    const settingsObject = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
    }, {} as Record<string, string | null>)

    return NextResponse.json(settingsObject)
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()

        // Batch update settings
        for (const [key, value] of Object.entries(body)) {
            const existing = await db.select().from(settings).where(eq(settings.key, key))

            if (existing.length > 0) {
                await db.update(settings)
                    .set({ value: value as string, updatedAt: new Date() })
                    .where(eq(settings.key, key))
            } else {
                await db.insert(settings).values({
                    key,
                    value: value as string
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
