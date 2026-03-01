import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
    // Make first track (or all tasks without 'test()') Theory?
    // Let's just update all tasks in track 1 to be "quiz" as a test, or maybe let's check which tasks the user wants as theory.
    // The user said "this is actually theory" while looking at tasks 1.1 to 1.5. These are all in track 1.
    // Let's update Track 1 to have type: 'quiz' (Theory)
    await db.update(tasks).set({ type: "quiz" }).where(eq(tasks.trackId, 1));
    return NextResponse.json({ success: true });
}
