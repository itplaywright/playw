import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userQuestions = await db.query.questions.findMany({
        where: eq(questions.userId, session.user.id),
        orderBy: [desc(questions.createdAt)],
    });

    return NextResponse.json(userQuestions);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { taskId, content } = await req.json();

        if (!taskId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [newQuestion] = await db.insert(questions).values({
            userId: session.user.id,
            taskId,
            content,
            status: "pending",
        }).returning();

        return NextResponse.json(newQuestion);
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
    }
}
