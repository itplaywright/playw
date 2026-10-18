import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, results, projectBoards, users, roles } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, asc } from "drizzle-orm"
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
    const statusMap: Record<number, "Виконано" | "В процесі" | "Не розпочато"> = {}
    for (const task of visibleTasks) {
        const taskResults = userResults.filter(r => r.taskId === task.id)
        if (taskResults.some(r => r.status === 'passed')) {
            statusMap[task.id] = "Виконано"
        } else if (taskResults.length > 0) {
            statusMap[task.id] = "В процесі"
        } else {
            statusMap[task.id] = "Не розпочато"
        }
    }

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
        />
    )
}
