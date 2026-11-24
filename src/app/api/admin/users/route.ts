import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, isBlocked, role, dynamicRoleId } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updateData: any = {}
        if (typeof isBlocked === "boolean") updateData.isBlocked = isBlocked
        if (role && (role === "admin" || role === "user")) updateData.role = role
        if (dynamicRoleId !== undefined) {
            updateData.dynamicRoleId = dynamicRoleId === "none" || dynamicRoleId === null ? null : Number(dynamicRoleId)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 })
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))

        const updatedUser = await db.select().from(users).where(eq(users.id, id))

        return NextResponse.json(updatedUser[0])
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

        await db.delete(users).where(eq(users.id, id))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
