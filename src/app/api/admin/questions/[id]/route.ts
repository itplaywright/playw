import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { answer } = await req.json();
        const questionId = parseInt(id);

        if (isNaN(questionId) || !answer) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const [updatedQuestion] = await db.update(questions)
            .set({
                answer,
                status: "answered",
                isReadByUser: false,
                answeredAt: new Date(),
            })
            .where(eq(questions.id, questionId))
            .returning();

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        console.error("Error answering question:", error);
        return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
    }
}
