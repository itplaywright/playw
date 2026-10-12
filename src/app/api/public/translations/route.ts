import { db } from "@/db"
import { translations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const locale = searchParams.get("locale") || "uk"

    try {
        const data = await db.select().from(translations).where(eq(translations.locale, locale))
        
        // Return as key-value pair object
        const result = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({}, { status: 500 })
    }
}
