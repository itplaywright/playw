
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tracks } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await db.select().from(tracks).orderBy(asc(tracks.order))
    return NextResponse.json(data)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, order } = body

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const newTrack = await db.insert(tracks).values({
            title,
            description,
            order: order || 0,
            isActive: true
        }).returning()

        return NextResponse.json(newTrack[0])
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
        const { id, title, description, order, isActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updatedTrack = await db.update(tracks)
            .set({
                title,
                description,
                order,
                isActive
            })
            .where(eq(tracks.id, id))
            .returning()

        return NextResponse.json(updatedTrack[0])
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

        await db.delete(tracks).where(eq(tracks.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
