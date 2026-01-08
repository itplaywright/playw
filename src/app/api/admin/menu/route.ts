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
        const { title, url, type, order, isVisible } = body

        if (!title || !url) {
            return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
        }

        const newItem = await db.insert(menuItems).values({
            title,
            url,
            type: type || "internal",
            order: order || 0,
            isVisible: isVisible !== undefined ? isVisible : true
        }).returning()

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
        const { id, title, url, type, order, isVisible } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updatedItem = await db.update(menuItems)
            .set({ title, url, type, order, isVisible })
            .where(eq(menuItems.id, id))
            .returning()

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
