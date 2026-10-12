import { auth } from "@/lib/auth"
import { db } from "@/db"
import { customBlocks } from "@/db/schema"
import { eq, asc, and } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const locale = searchParams.get("locale") || "uk"

    const data = await db.select().from(customBlocks).where(eq(customBlocks.locale, locale)).orderBy(asc(customBlocks.order))
    return NextResponse.json(data)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        await db.insert(customBlocks).values({
            title: body.title,
            content: body.content,
            locale: body.locale || "uk",
            order: body.order || 0,
            isVisible: body.isVisible ?? true
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, ...data } = body
        
        await db.update(customBlocks).set(data).where(eq(customBlocks.id, id))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        await db.delete(customBlocks).where(eq(customBlocks.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
