import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const allProducts = await db.select().from(products).orderBy(desc(products.createdAt))
        return NextResponse.json(allProducts)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, price, grantedRoleId, isActive } = body

        if (!title || price === undefined) {
            return NextResponse.json({ error: "Title and price are required" }, { status: 400 })
        }

        const newProduct = await db.insert(products)
            .values({
                title,
                description,
                price: Math.round(parseFloat(price) * 100), // Store as cents
                grantedRoleId,
                isActive: isActive !== undefined ? isActive : true
            })
            .returning()

        return NextResponse.json(newProduct[0])
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
        const { id, title, description, price, grantedRoleId, isActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (price !== undefined) updateData.price = Math.round(parseFloat(price) * 100)
        if (grantedRoleId !== undefined) updateData.grantedRoleId = grantedRoleId
        if (isActive !== undefined) updateData.isActive = isActive

        const updatedProduct = await db.update(products)
            .set(updateData)
            .where(eq(products.id, id))
            .returning()

        return NextResponse.json(updatedProduct[0])
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

        await db.delete(products).where(eq(products.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
