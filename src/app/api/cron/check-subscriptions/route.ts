import { db } from "@/db"
import { users, userProducts, products, roles } from "@/db/schema"
import { eq, and, lt } from "drizzle-orm"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * Maintenance cron job to check and mark expired subscriptions,
 * downgrading past-due users to Demo (or their owned lifetime product).
 */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET

        // Optional protection if CRON_SECRET is configured
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const now = new Date()

        // 1. Query active subscriptions whose expiresAt is past
        const expiredPurchases = await db
            .select({
                id: userProducts.id,
                userId: userProducts.userId,
                productId: userProducts.productId,
                expiresAt: userProducts.expiresAt,
                grantedRoleId: products.grantedRoleId,
            })
            .from(userProducts)
            .leftJoin(products, eq(userProducts.productId, products.id))
            .where(
                and(
                    eq(userProducts.status, "active"),
                    lt(userProducts.expiresAt, now)
                )
            )

        let processedCount = 0

        // Fetch default role (Demo)
        const [defaultRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.isDefault, true))
            .limit(1)

        for (const item of expiredPurchases) {
            // Update purchase status to expired
            await db.update(userProducts)
                .set({ status: "expired" })
                .where(eq(userProducts.id, item.id))

            // Check if user has any OTHER active product (e.g. lifetime Base)
            const remainingActive = await db
                .select({
                    id: userProducts.id,
                    grantedRoleId: products.grantedRoleId,
                })
                .from(userProducts)
                .leftJoin(products, eq(userProducts.productId, products.id))
                .where(
                    and(
                        eq(userProducts.userId, item.userId),
                        eq(userProducts.status, "active")
                    )
                )

            const lifetimeBase = remainingActive.find(p => p.grantedRoleId === 2)
            const newRoleId = lifetimeBase ? 2 : (defaultRole?.id ?? 1)

            // Downgrade user's dynamic role
            await db.update(users)
                .set({ dynamicRoleId: newRoleId })
                .where(eq(users.id, item.userId))

            processedCount++
        }

        return NextResponse.json({
            success: true,
            processedCount,
            timestamp: now.toISOString(),
            message: `Successfully processed ${processedCount} expired subscriptions.`
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
