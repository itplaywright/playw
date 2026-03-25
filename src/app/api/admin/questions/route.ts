import { db } from "@/db";
import { questions, users, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db.select({
        id: questions.id,
        content: questions.content,
        userId: questions.userId,
        taskId: questions.taskId,
        status: questions.status,
        answer: questions.answer,
        isReadByUser: questions.isReadByUser,
        createdAt: questions.createdAt,
        answeredAt: questions.answeredAt,
        user: {
            id: users.id,
            email: users.email,
        },
        task: {
            id: tasks.id,
            title: tasks.title,
        }
    })
        .from(questions)
        .leftJoin(users, eq(questions.userId, users.id))
        .leftJoin(tasks, eq(questions.taskId, tasks.id))
        .orderBy(desc(questions.createdAt))

    return NextResponse.json(data)
}
