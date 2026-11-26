import { db } from "@/db"
import { users, roles, userProducts } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export interface UserPermissions {
    userId: string
    isAdmin: boolean
    roleId: number | null
    roleName: string
    maxTrackOrder: number
    hasPracticeAccess: boolean
    hasInterviewAccess: boolean
    hasMentorReview: boolean
    hasAiReview: boolean
    isDemo: boolean
    canAccessTrack: (trackOrder: number | null) => boolean
}

/**
 * Centrally resolves a user's permissions based on their global role (admin/user),
 * dynamic role (Demo, Base, Pro, B2B), and active purchases.
 */
export async function getUserPermissions(
    userId: string,
    userGlobalRole?: string | null
): Promise<UserPermissions> {
    const isAdmin = userGlobalRole === "admin"

    if (isAdmin) {
        return {
            userId,
            isAdmin: true,
            roleId: null,
            roleName: "Admin",
            maxTrackOrder: 999,
            hasPracticeAccess: true,
            hasInterviewAccess: true,
            hasMentorReview: true,
            hasAiReview: true,
            isDemo: false,
            canAccessTrack: () => true,
        }
    }

    // Fetch user and joined dynamic role
    const [userRecord] = await db
        .select({
            id: users.id,
            role: users.role,
            dynamicRoleId: users.dynamicRoleId,
            roleObj: {
                id: roles.id,
                name: roles.name,
                maxTrackOrder: roles.maxTrackOrder,
                hasPracticeAccess: roles.hasPracticeAccess,
                hasInterviewAccess: roles.hasInterviewAccess,
                hasMentorReview: roles.hasMentorReview,
                hasAiReview: roles.hasAiReview,
                isDefault: roles.isDefault,
            }
        })
        .from(users)
        .leftJoin(roles, eq(users.dynamicRoleId, roles.id))
        .where(eq(users.id, userId))
        .limit(1)

    // Fall back to default role (Demo) if user has no assigned dynamic role
    let activeRole = userRecord?.roleObj
    if (!activeRole || !activeRole.id) {
        const [defaultRole] = await db
            .select({
                id: roles.id,
                name: roles.name,
                maxTrackOrder: roles.maxTrackOrder,
                hasPracticeAccess: roles.hasPracticeAccess,
                hasInterviewAccess: roles.hasInterviewAccess,
                hasMentorReview: roles.hasMentorReview,
                hasAiReview: roles.hasAiReview,
                isDefault: roles.isDefault,
            })
            .from(roles)
            .where(eq(roles.isDefault, true))
            .limit(1)

        activeRole = defaultRole || null
    }

    // Check if user has an active product purchase that elevates permissions
    const activePurchases = await db
        .select()
        .from(userProducts)
        .where(
            and(
                eq(userProducts.userId, userId),
                eq(userProducts.status, "active")
            )
        )
        .limit(1)

    const hasActiveSubscription = activePurchases.length > 0

    // Compute effective values
    const roleName = hasActiveSubscription && (!activeRole || activeRole.name === "Demo")
        ? "PRO Студент"
        : activeRole?.name || "Demo"

    const isDemo = !hasActiveSubscription && (
        !activeRole ||
        activeRole.name.toLowerCase().includes("demo") ||
        activeRole.name.toLowerCase().includes("демо") ||
        (activeRole.maxTrackOrder !== null && activeRole.maxTrackOrder <= 2 && !activeRole.hasInterviewAccess)
    )

    const maxTrackOrder = hasActiveSubscription ? 10 : (activeRole?.maxTrackOrder ?? 2)
    const hasPracticeAccess = hasActiveSubscription ? true : Boolean(activeRole?.hasPracticeAccess)
    const hasInterviewAccess = hasActiveSubscription ? true : Boolean(activeRole?.hasInterviewAccess)
    const hasMentorReview = hasActiveSubscription ? true : Boolean(activeRole?.hasMentorReview)
    const hasAiReview = hasActiveSubscription ? true : Boolean(activeRole?.hasAiReview)

    return {
        userId,
        isAdmin: false,
        roleId: activeRole?.id || null,
        roleName,
        maxTrackOrder,
        hasPracticeAccess,
        hasInterviewAccess,
        hasMentorReview,
        hasAiReview,
        isDemo,
        canAccessTrack: (trackOrder: number | null) => {
            if (trackOrder === null || trackOrder === undefined) return true
            return trackOrder <= maxTrackOrder
        }
    }
}
