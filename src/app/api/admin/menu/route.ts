import { auth } from "@/lib/auth"
import { db } from "@/db"
import { menuItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await db.select().from(menuItems).orderBy(asc(menuItems.order))
    return NextResponse.json(items)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, titleEn, titleRu, url, type, order, isVisible } = body

        if (!title || !url) {
            return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
        }

        const [__insertResult] = await db.insert(menuItems).values({
            title,
            titleEn: titleEn || null,
            titleRu: titleRu || null,
            url,
            type: type || "internal",
            order: order || 0,
            isVisible: isVisible !== undefined ? isVisible : true
        })
        const newItem = await db.select().from(menuItems).where(eq(menuItems.id, __insertResult.insertId))

        return NextResponse.json(newItem[0])
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

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        // Build update object, only include defined fields
        const updateData: any = {}
        if (data.title !== undefined) updateData.title = data.title
        if (data.titleEn !== undefined) updateData.titleEn = data.titleEn || null
        if (data.titleRu !== undefined) updateData.titleRu = data.titleRu || null
        if (data.url !== undefined) updateData.url = data.url
        if (data.type !== undefined) updateData.type = data.type
        if (data.order !== undefined) updateData.order = data.order
        if (data.isVisible !== undefined) updateData.isVisible = data.isVisible

        await db.update(menuItems).set(updateData).where(eq(menuItems.id, id))

        const updatedItem = await db.select().from(menuItems).where(eq(menuItems.id, id))
        return NextResponse.json(updatedItem[0])
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

        await db.delete(menuItems).where(eq(menuItems.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
