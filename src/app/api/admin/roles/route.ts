import { auth } from "@/lib/auth"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))
        return NextResponse.json(allRoles)
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
        const { name, description, maxTrackOrder, isDefault } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        // If this is set as default, unset others first if needed
        if (isDefault) {
            await db.update(roles).set({ isDefault: false })
        }

        const newRole = await db.insert(roles)
            .values({ name, description, maxTrackOrder, isDefault })
            .returning()

        return NextResponse.json(newRole[0])
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
        const { id, name, description, maxTrackOrder, isDefault } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        if (isDefault) {
            await db.update(roles).set({ isDefault: false })
        }

        const updatedRole = await db.update(roles)
            .set({ name, description, maxTrackOrder, isDefault })
            .where(eq(roles.id, id))
            .returning()

        return NextResponse.json(updatedRole[0])
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

        await db.delete(roles).where(eq(roles.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
