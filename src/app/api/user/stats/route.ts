import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { results, tasks, tracks, questions } from "@/db/schema"
import { eq, and, sql, count, countDistinct } from "drizzle-orm"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    try {
        // Total tasks count
        const [totalTasksRow] = await db
            .select({ count: count() })
            .from(tasks)
            .where(eq(tasks.isActive, true))

        // User's passed unique tasks
        const [passedRow] = await db
            .select({ count: countDistinct(results.taskId) })
            .from(results)
            .where(and(eq(results.userId, userId), eq(results.status, "passed")))

        // Total user attempts (passed + failed)
        const [attemptsRow] = await db
            .select({ count: count() })
            .from(results)
            .where(eq(results.userId, userId))

        // Total user passed attempts
        const [passedAttemptsRow] = await db
            .select({ count: count() })
            .from(results)
            .where(and(eq(results.userId, userId), eq(results.status, "passed")))

        // Pending questions
        const [pendingRow] = await db
            .select({ count: count() })
            .from(questions)
            .where(and(eq(questions.userId, userId), eq(questions.status, "pending")))

        const totalAttempts = attemptsRow?.count ?? 0
        const passedAttempts = passedAttemptsRow?.count ?? 0
        const completedTasks = passedRow?.count ?? 0
        const totalTasks = totalTasksRow?.count ?? 0
        const pendingQuestions = pendingRow?.count ?? 0

        const successRate = totalAttempts > 0
            ? Math.round((passedAttempts / totalAttempts) * 100)
            : 0

        // Progress per track
        const allTracks = await db
            .select({ id: tracks.id, title: tracks.title, order: tracks.order })
            .from(tracks)
            .where(eq(tracks.isActive, true))
            .orderBy(tracks.order)

        const trackProgress = await Promise.all(
            allTracks.map(async (track) => {
                const [trackTasksRow] = await db
                    .select({ count: count() })
                    .from(tasks)
                    .where(and(eq(tasks.trackId, track.id), eq(tasks.isActive, true)))

                const [doneRow] = await db
                    .select({ count: countDistinct(results.taskId) })
                    .from(results)
                    .innerJoin(tasks, eq(results.taskId, tasks.id))
                    .where(and(
                        eq(results.userId, userId),
                        eq(results.status, "passed"),
                        eq(tasks.trackId, track.id)
                    ))

                return {
                    id: track.id,
                    title: track.title,
                    order: track.order,
                    total: trackTasksRow?.count ?? 0,
                    done: doneRow?.count ?? 0,
                }
            })
        )

        return NextResponse.json({
            totalTasks,
            completedTasks,
            totalAttempts,
            successRate,
            pendingQuestions,
            trackProgress,
        })
    } catch (error: any) {
        console.error("Stats error:", error.message)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
