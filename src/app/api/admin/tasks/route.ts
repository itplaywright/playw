
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const trackId = searchParams.get("trackId")

    let query = db.select().from(tasks)

    if (trackId) {
        // @ts-ignore
        query = query.where(eq(tasks.trackId, parseInt(trackId)))
    }

    const data = await query.orderBy(asc(tasks.order))
    return NextResponse.json(data)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, trackId, difficulty, initialCode, order } = body

        if (!title || !description || !trackId || !initialCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const newTask = await db.insert(tasks).values({
            title,
            description,
            trackId: parseInt(trackId),
            difficulty: difficulty || "easy",
            initialCode,
            order: order || 0,
            isActive: true
        }).returning()

        return NextResponse.json(newTask[0])
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
        const { id, title, description, trackId, difficulty, initialCode, order, isActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updatedTask = await db.update(tasks)
            .set({
                title,
                description,
                trackId: trackId ? parseInt(trackId) : undefined,
                difficulty,
                initialCode,
                order,
                isActive
            })
            .where(eq(tasks.id, id))
            .returning()

        return NextResponse.json(updatedTask[0])
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

        await db.delete(tasks).where(eq(tasks.id, parseInt(id)))
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
