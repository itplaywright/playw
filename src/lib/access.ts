import { db } from "@/db"
import { settings, userProducts } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"

/**
 * Checks if a user has access to the platform content.
 * Access is granted if:
 * 1. The user is an admin.
 * 2. The user has an active subscription (product purchase with active status).
 * 3. The user is within the global free trial period.
 */
export async function checkHasAccess(userId: string, userRole: string, userCreatedAt: Date | null): Promise<boolean> {
    // Admins always have access
    if (userRole === "admin") return true

    // Check for an active product subscription
    const activePurchase = await db
        .select()
        .from(userProducts)
        .where(
            and(
                eq(userProducts.userId, userId),
                eq(userProducts.status, "active")
            )
        )
        .limit(1)

    if (activePurchase.length > 0) return true

    // Check free trial period from global settings
    const trialSetting = await db.select().from(settings).where(eq(settings.key, "free_trial_days")).limit(1)
    const freeTrialDays = parseInt(trialSetting[0]?.value ?? "0", 10)

    if (freeTrialDays > 0 && userCreatedAt) {
        const trialExpiry = new Date(userCreatedAt.getTime() + freeTrialDays * 24 * 60 * 60 * 1000)
        if (new Date() < trialExpiry) return true
    }

    return false
}
