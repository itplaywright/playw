import { NextResponse } from "next/server"

export async function GET() {
    try {
        const { db } = await import("@/db")
        const { tasks } = await import("@/db/schema")
        const { eq } = await import("drizzle-orm")
        
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, 1025),
        })
        
        return NextResponse.json({ 
            found: !!task, 
            title: task?.title,
            dbUrl: process.env.DATABASE_URL ? "SET" : "MISSING"
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
