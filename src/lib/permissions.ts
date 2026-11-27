import { db } from "@/db"
import { users, roles, userProducts, products } from "@/db/schema"
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
    isSubscriptionExpired: boolean
    subscriptionExpiresAt: Date | null
    canAccessTrack: (trackOrder: number | null) => boolean
}

/**
 * Centrally resolves a user's permissions based on their global role (admin/user),
 * dynamic role (Demo, Base, Pro, B2B), and active purchases.
 * Automatically checks and expires past-due subscriptions, downgrading user role.
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
            isSubscriptionExpired: false,
            subscriptionExpiresAt: null,
            canAccessTrack: () => true,
        }
    }

    // 1. Fetch user and joined dynamic role
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

    let activeRole = userRecord?.roleObj?.id ? userRecord.roleObj : (defaultRole || null)

    // 2. Query all purchases/subscriptions of this user with product details
    const purchases = await db
        .select({
            id: userProducts.id,
            status: userProducts.status,
            expiresAt: userProducts.expiresAt,
            productId: userProducts.productId,
            productType: products.type,
            grantedRoleId: products.grantedRoleId,
            productTitle: products.title,
        })
        .from(userProducts)
        .leftJoin(products, eq(userProducts.productId, products.id))
        .where(eq(userProducts.userId, userId))

    const now = new Date()
    let hasActiveSubscription = false
    let isSubscriptionExpired = false
    let latestExpiredDate: Date | null = null

    // Check each purchase for expiration
    for (const p of purchases) {
        const isPastDue = p.expiresAt ? new Date(p.expiresAt) < now : false

        if (p.status === "active" && isPastDue) {
            // Subscription expired! Mark status as "expired" in DB
            await db.update(userProducts)
                .set({ status: "expired" })
                .where(eq(userProducts.id, p.id))
            p.status = "expired"
            isSubscriptionExpired = true
            if (p.expiresAt && (!latestExpiredDate || new Date(p.expiresAt) > new Date(latestExpiredDate))) {
                latestExpiredDate = new Date(p.expiresAt)
            }
        } else if (p.status === "expired") {
            isSubscriptionExpired = true
            if (p.expiresAt && (!latestExpiredDate || new Date(p.expiresAt) > new Date(latestExpiredDate))) {
                latestExpiredDate = new Date(p.expiresAt)
            }
        } else if (p.status === "active" && !isPastDue) {
            hasActiveSubscription = true
        }
    }

    // 3. Automated Downgrade Check:
    // If user's subscription expired, they have NO active subscription,
    // and their dynamic role is Pro (3) or B2B (4):
    if (isSubscriptionExpired && !hasActiveSubscription && userRecord?.id) {
        const isElevatedRole = userRecord.dynamicRoleId === 3 || userRecord.dynamicRoleId === 4

        if (isElevatedRole) {
            // Find if user owns another non-expiring product (e.g. lifetime Base course)
            const lifetimeBase = purchases.find(
                p => p.status === "active" && p.grantedRoleId === 2
            )
            const targetRoleId = lifetimeBase ? 2 : (defaultRole?.id ?? 1)

            // Downgrade in users table
            await db.update(users)
                .set({ dynamicRoleId: targetRoleId })
                .where(eq(users.id, userId))

            // Load the newly downgraded role object
            const [newRoleObj] = await db
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
                .where(eq(roles.id, targetRoleId))
                .limit(1)

            activeRole = newRoleObj || defaultRole || null
        }
    }

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
        isSubscriptionExpired: isSubscriptionExpired && !hasActiveSubscription,
        subscriptionExpiresAt: latestExpiredDate,
        canAccessTrack: (trackOrder: number | null) => {
            if (trackOrder === null || trackOrder === undefined) return true
            return trackOrder <= maxTrackOrder
        }
    }
}
