import { auth } from "@/lib/auth"
import { db } from "@/db"
import { adBlocks } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const placement = searchParams.get("placement")

    let query = db.select().from(adBlocks)

    if (placement) {
        // @ts-ignore
        query = query.where(eq(adBlocks.placement, placement))
    }

    const blocks = await query.orderBy(asc(adBlocks.order))
    return NextResponse.json(blocks)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, type, placement, content, imageUrl, linkUrl, buttonText, order, isActive } = body

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const newBlock = await db.insert(adBlocks).values({
            title,
            type: type || "banner",
            placement: placement || "global",
            content,
            imageUrl,
            linkUrl,
            buttonText,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        }).returning()

        return NextResponse.json(newBlock[0])
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
        const { id, title, type, placement, content, imageUrl, linkUrl, buttonText, order, isActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updatedBlock = await db.update(adBlocks)
            .set({ title, type, placement, content, imageUrl, linkUrl, buttonText, order, isActive })
            .where(eq(adBlocks.id, id))
            .returning()

        return NextResponse.json(updatedBlock[0])
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

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await db.delete(adBlocks).where(eq(adBlocks.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
