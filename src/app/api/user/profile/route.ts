import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
            id: true,
            name: true,
            email: true,
            image: true,
            firstName: true,
            lastName: true,
            phone: true,
            telegram: true,
            whatsapp: true,
        },
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, phone, telegram, whatsapp } = body

    // Basic validation — allow empty strings to clear fields
    const updateData: Record<string, string | null> = {
        firstName: typeof firstName === "string" ? firstName.trim() || null : undefined as any,
        lastName: typeof lastName === "string" ? lastName.trim() || null : undefined as any,
        phone: typeof phone === "string" ? phone.trim() || null : undefined as any,
        telegram: typeof telegram === "string" ? telegram.trim() || null : undefined as any,
        whatsapp: typeof whatsapp === "string" ? whatsapp.trim() || null : undefined as any,
    }

    // Remove undefined keys
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key]
    })

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    await db.update(users).set(updateData).where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
}
