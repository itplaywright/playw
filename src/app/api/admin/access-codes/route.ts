import { auth } from "@/lib/auth"
import { db } from "@/db"
import { accessCodes, products, roles } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const allCodes = await db.select({
            id: accessCodes.id,
            code: accessCodes.code,
            productId: accessCodes.productId,
            maxUses: accessCodes.maxUses,
            usedCount: accessCodes.usedCount,
            expiresAt: accessCodes.expiresAt,
            isActive: accessCodes.isActive,
            createdAt: accessCodes.createdAt,
            productTitle: products.title,
            productType: products.type,
            grantedRoleName: roles.name,
        })
        .from(accessCodes)
        .leftJoin(products, eq(accessCodes.productId, products.id))
        .leftJoin(roles, eq(products.grantedRoleId, roles.id))
        .orderBy(desc(accessCodes.createdAt))
        
        return NextResponse.json(allCodes)
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
        const { productId, maxUses, customCode } = body

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        // Generate a random code if not provided
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 12; i++) {
                if (i > 0 && i % 4 === 0) result += '-';
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        const finalCode = (customCode || generateCode()).toUpperCase().replace(/\s/g, '');

        const [__ir0] = await db.insert(accessCodes).values({
            code: finalCode,
            productId: parseInt(productId),
            maxUses: parseInt(maxUses) || 1,
            isActive: true
        })
        
        const newCode = await db.select().from(accessCodes).where(eq(accessCodes.id, __ir0.insertId))

        return NextResponse.json(newCode[0])
    } catch (error: any) {
        // Handle unique constraint error
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "Цей код вже існує. Спробуйте інший." }, { status: 400 })
        }
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
        const { id, isActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await db.update(accessCodes)
            .set({ isActive })
            .where(eq(accessCodes.id, id))

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

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await db.delete(accessCodes).where(eq(accessCodes.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
