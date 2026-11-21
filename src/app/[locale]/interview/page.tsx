import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions, users, roles } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, desc } from "drizzle-orm"
import { checkHasAccess } from "@/lib/access"
import InterviewClient from "@/components/interview/InterviewClient"

export default async function InterviewPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    const userWithRole = (await db.select({
        id: users.id,
        createdAt: users.createdAt,
        dynamicRole: {
            id: roles.id,
            name: roles.name,
            maxTrackOrder: roles.maxTrackOrder,
            hasPracticeAccess: roles.hasPracticeAccess,
        }
    })
        .from(users)
        .leftJoin(roles, eq(users.dynamicRoleId, roles.id))
        .where(eq(users.id, session.user.id)))[0] as any

    const hasAccess = await checkHasAccess(
        session.user.id,
        (session.user as any).role,
        userWithRole?.createdAt ?? null
    )
    if (!hasAccess) {
        redirect("/pricing")
    }

    // Load past sessions
    const pastSessions = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.userId, session.user.id))
        .orderBy(desc(interviewSessions.createdAt))
        .limit(6)

    return (
        <InterviewClient
            locale={locale}
            userName={session.user.name || "Candidate"}
            initialHistory={pastSessions as any}
        />
    )
}
