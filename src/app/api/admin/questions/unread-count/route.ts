import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [result] = await db
        .select({ value: count() })
        .from(questions)
        .where(eq(questions.status, "pending"));

    return NextResponse.json({ count: result?.value || 0 });
}
