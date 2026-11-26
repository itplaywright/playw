import { auth } from "@/lib/auth"
import { db } from "@/db"
import { interviewSessions } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, desc } from "drizzle-orm"
import { getUserPermissions } from "@/lib/permissions"
import InterviewClient from "@/components/interview/InterviewClient"

export default async function InterviewPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    const permissions = await getUserPermissions(session.user.id, (session.user as any).role)

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
            hasInterviewAccess={permissions.hasInterviewAccess}
        />
    )
}
