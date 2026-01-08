import { db } from "@/db"
import { adBlocks } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const placement = searchParams.get("placement") || "global"

        const blocks = await db.select()
            .from(adBlocks)
            .where(and(
                eq(adBlocks.placement, placement as any),
                eq(adBlocks.isActive, true)
            ))
            .orderBy(asc(adBlocks.order))

        return NextResponse.json(blocks)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
