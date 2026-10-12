import { auth } from "@/lib/auth"
import { db } from "@/db"
import { translations } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const locale = searchParams.get("locale") || "uk"

    const data = await db.select().from(translations).where(eq(translations.locale, locale))
    
    // Return as key-value pair object
    const result = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, string>)

    return NextResponse.json(result)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { locale, key, value } = body

        if (!locale || !key || value === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Upsert logic (delete and insert, or update if exists)
        const existing = await db.select().from(translations).where(and(
            eq(translations.locale, locale),
            eq(translations.key, key)
        ))

        if (existing.length > 0) {
            await db.update(translations)
                .set({ value, updatedAt: new Date() })
                .where(and(eq(translations.locale, locale), eq(translations.key, key)))
        } else {
            await db.insert(translations).values({
                locale,
                key,
                value
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
