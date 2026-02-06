import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
        .update(questions)
        .set({ isReadByUser: true })
        .where(
            and(
                eq(questions.userId, session.user.id),
                eq(questions.status, "answered")
            )
        );

    return NextResponse.json({ success: true });
}
