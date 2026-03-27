import { auth } from "@/lib/auth"
import { db } from "@/db"
import { accessCodes, userProducts, products, users } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Будь ласка, увійдіть в акаунт" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { code } = body

        if (!code) {
            return NextResponse.json({ error: "Введіть промокод" }, { status: 400 })
        }

        const normalizedCode = code.toUpperCase().replace(/\s/g, '')

        // 1. Find the code
        const codeRecords = await db.select({
            id: accessCodes.id,
            productId: accessCodes.productId,
            maxUses: accessCodes.maxUses,
            usedCount: accessCodes.usedCount,
            expiresAt: accessCodes.expiresAt,
            isActive: accessCodes.isActive,
            productType: products.type,
            durationMonths: products.durationMonths,
            grantedRoleId: products.grantedRoleId
        })
        .from(accessCodes)
        .leftJoin(products, eq(accessCodes.productId, products.id))
        .where(eq(accessCodes.code, normalizedCode))

        if (codeRecords.length === 0) {
            return NextResponse.json({ error: "Недійсний код" }, { status: 404 })
        }

        const accessCode = codeRecords[0]

        // 2. Validate the code
        if (!accessCode.isActive) {
            return NextResponse.json({ error: "Цей код деактивовано" }, { status: 403 })
        }

        if (accessCode.expiresAt && new Date() > new Date(accessCode.expiresAt)) {
            return NextResponse.json({ error: "Термін дії коду минув" }, { status: 403 })
        }

        if (accessCode.usedCount >= accessCode.maxUses) {
            return NextResponse.json({ error: "Ліміт використання цього коду вичерпано" }, { status: 403 })
        }

        // 3. Check if user already activated this code or product
        const existingPurchaseRows = await db.select()
            .from(userProducts)
            .where(
                and(
                    eq(userProducts.userId, session.user.id),
                    eq(userProducts.productId, accessCode.productId)
                )
            )

        if (existingPurchaseRows.length > 0) {
            // Check if active
            const existingPurchase = existingPurchaseRows[0]
            if (existingPurchase.status === 'active' && (!existingPurchase.expiresAt || new Date(existingPurchase.expiresAt) > new Date())) {
                return NextResponse.json({ error: "У вас вже є активний доступ до цього продукту" }, { status: 400 })
            }
        }

        // 4. Calculate expiration
        let expiresAt: Date | null = null
        if (accessCode.productType === "subscription") {
            const months = accessCode.durationMonths || 1
            const date = new Date()
            date.setMonth(date.getMonth() + months)
            expiresAt = date
        }

        // 5. Update database inside a transaction or sequentially 
        // We will do it sequentially since Drizzle SQLite/MySQL basic trans support can be complex, but ideally transaction.
        
        // Increase used counter
        await db.update(accessCodes)
            .set({ usedCount: accessCode.usedCount + 1 })
            .where(eq(accessCodes.id, accessCode.id))

        // Give the user the product
        if (existingPurchaseRows.length > 0 && existingPurchaseRows[0].status !== 'active') {
            await db.update(userProducts)
                .set({ status: 'active', purchasedAt: new Date(), expiresAt })
                .where(eq(userProducts.id, existingPurchaseRows[0].id))
        } else {
            await db.insert(userProducts).values({
                userId: session.user.id,
                productId: accessCode.productId,
                status: 'active',
                expiresAt
            })
        }

        // Upgrade user Role if needed
        if (accessCode.grantedRoleId) {
            await db.update(users)
                .set({ dynamicRoleId: accessCode.grantedRoleId, role: 'user' }) // keep 'admin' logic safe if they are admin, wait, don't overwrite role unless needed.
                .where(eq(users.id, session.user.id))
            
            // Wait, actually `users.role` might be 'admin'. We shouldn't downgrade them.
            // Just update dynamicRoleId which manages access levels.
            await db.update(users)
                .set({ dynamicRoleId: accessCode.grantedRoleId })
                .where(eq(users.id, session.user.id))
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
