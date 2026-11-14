import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, results, projectBoards, users, roles, taskSubmissions } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, asc, desc } from "drizzle-orm"
import DashboardClient from "@/components/dashboard/DashboardClient"
import { checkHasAccess } from "@/lib/access"

import { getLocale } from "next-intl/server"

export default async function Dashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (!(session.user as any).onboardingCompleted) {
        redirect("/setup")
    }

    const locale = await getLocale()

    const userWithRole = await db.select({
        id: users.id,
        createdAt: users.createdAt,
        firstName: users.firstName,
        telegram: users.telegram,
        telegramChatId: users.telegramChatId,
        whatsapp: users.whatsapp,
        dynamicRole: {
            id: roles.id,
            name: roles.name,
            maxTrackOrder: roles.maxTrackOrder,
            hasPracticeAccess: roles.hasPracticeAccess,
        }
    })
        .from(users)
        .leftJoin(roles, eq(users.dynamicRoleId, roles.id))
        .where(eq(users.id, session.user.id!))
        .then(res => res[0])

    // Check free trial / subscription access
    const hasAccess = await checkHasAccess(
        session.user.id!,
        (session.user as any).role,
        userWithRole?.createdAt ?? null
    )
    if (!hasAccess) redirect("/pricing")

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order))
    const allTasks = await db.select().from(tasks).orderBy(asc(tasks.order), asc(tasks.id))
    const userResults = await db.select().from(results).where(eq(results.userId, session.user.id!))
    const userSubmissions = await db.select().from(taskSubmissions).where(eq(taskSubmissions.userId, session.user.id!)).orderBy(desc(taskSubmissions.createdAt))
    const boards = await db.select().from(projectBoards)

    const isAdmin = (session.user as any).role === "admin"

    const localizedTracks = allTracks.map(t => ({
        ...t,
        title: locale === 'en' ? (t.titleEn || t.title) : locale === 'ru' ? (t.titleRu || t.title) : t.title,
        description: locale === 'en' ? (t.descriptionEn || t.description) : locale === 'ru' ? (t.descriptionRu || t.description) : t.description,
    }))

    const localizedTasks = allTasks.map(t => ({
        ...t,
        title: locale === 'en' ? (t.titleEn || t.title) : locale === 'ru' ? (t.titleRu || t.title) : t.title,
        description: locale === 'en' ? (t.descriptionEn || t.description) : locale === 'ru' ? (t.descriptionRu || t.description) : t.description,
        initialCode: locale === 'en' ? (t.initialCodeEn || t.initialCode) : locale === 'ru' ? (t.initialCodeRu || t.initialCode) : t.initialCode,
    }))

    const visibleTracks = isAdmin ? localizedTracks : localizedTracks.filter(t => t.isActive)
    const visibleTasks = isAdmin ? localizedTasks : localizedTasks.filter(t => t.isActive)

    // Pre-compute status map for all tasks
    // RULE: Without mentor review, code tasks are NOT counted as completed!
    const statusMap: Record<number, "completed" | "pending" | "rejected" | "in_progress" | "not_started"> = {}
    for (const task of visibleTasks) {
        const taskSubs = userSubmissions.filter(s => s.taskId === task.id)
        const latestSub = taskSubs[0]

        if (latestSub) {
            if (latestSub.status === 'reviewed') {
                statusMap[task.id] = "completed"
            } else if (latestSub.status === 'pending') {
                statusMap[task.id] = "pending"
            } else if (latestSub.status === 'rejected') {
                statusMap[task.id] = "rejected"
            }
        } else {
            const taskResults = userResults.filter(r => r.taskId === task.id)
            if (task.type === 'quiz' && taskResults.some(r => r.status === 'passed')) {
                statusMap[task.id] = "completed"
            } else if (taskResults.length > 0) {
                statusMap[task.id] = "in_progress"
            } else {
                statusMap[task.id] = "not_started"
            }
        }
    }

    // Calculate real activity streak
    const activityDates = [
        ...userResults.map(r => r.createdAt),
        ...userSubmissions.map(s => s.createdAt)
    ].filter(Boolean) as Date[]

    const dateStrings = new Set(
        activityDates.map(d => {
            const date = new Date(d)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        })
    )

    let streakDays = 0
    if (dateStrings.size > 0) {
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

        let checkDate = dateStrings.has(todayStr) ? today : (dateStrings.has(yesterdayStr) ? yesterday : null)

        if (checkDate) {
            let cur = new Date(checkDate)
            while (true) {
                const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
                if (dateStrings.has(curStr)) {
                    streakDays++
                    cur.setDate(cur.getDate() - 1)
                } else {
                    break
                }
            }
        }
    }

    // Calculate real lines of code from submissions
    const taskCodeMap = new Map<number, string>()
    for (const sub of userSubmissions) {
        if (sub.taskId && sub.code && !taskCodeMap.has(sub.taskId)) {
            taskCodeMap.set(sub.taskId, sub.code)
        }
    }

    let totalLinesOfCode = 0
    for (const code of taskCodeMap.values()) {
        const lines = code.split('\n').filter(l => l.trim().length > 0).length
        totalLinesOfCode += lines
    }

    const pendingReviewCount = Object.values(statusMap).filter(s => s === "pending").length
    const rejectedCount = Object.values(statusMap).filter(s => s === "rejected").length

    // We prompt them if they haven't connected the bot
    const hasContacts = Boolean(userWithRole?.telegramChatId)

    return (
        <DashboardClient
            userId={session.user.id!}
            botUsername={process.env.TELEGRAM_BOT_USERNAME || 'PlaywrightMentorBot'}
            tracks={visibleTracks as any}
            tasks={visibleTasks as any}
            statusMap={statusMap}
            isAdmin={isAdmin}
            userName={session.user.name}
            userImage={session.user.image}
            firstName={userWithRole?.firstName}
            hasContacts={hasContacts}
            projects={boards as any}
            role={userWithRole?.dynamicRole}
            realStreak={streakDays}
            realLinesOfCode={totalLinesOfCode}
            pendingReviewCount={pendingReviewCount}
            rejectedCount={rejectedCount}
        />
    )
}
