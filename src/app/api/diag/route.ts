import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function GET() {
    const allTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        type: tasks.type
    }).from(tasks).limit(10);
    return NextResponse.json(allTasks);
}
