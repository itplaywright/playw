import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allQuestions = await db.query.questions.findMany({
        with: {
            user: true,
            task: true,
        },
        orderBy: [desc(questions.createdAt)],
    });

    return NextResponse.json(allQuestions);
}
