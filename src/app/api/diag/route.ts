import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await db.execute(sql`SELECT count(*) FROM results`);
        const tasks = await db.execute(sql`SELECT count(*) FROM tasks`);
        const users = await db.execute(sql`SELECT count(*) FROM "user"`);

        return NextResponse.json({
            status: "success",
            database_url_defined: !!process.env.DATABASE_URL,
            database_url_length: process.env.DATABASE_URL?.length,
            counts: {
                results: result.rows[0].count,
                tasks: tasks.rows[0].count,
                users: users.rows[0].count
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            error: error.message,
            database_url_defined: !!process.env.DATABASE_URL,
        }, { status: 500 });
    }
}
