import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import PricingClient from "@/components/pricing/PricingClient"
import { getTranslations } from "next-intl/server"

export const dynamic = "force-dynamic"

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params
    const t = await getTranslations({ locale: params.locale, namespace: "Pricing" })
    return {
        title: `${t("choosePlan")} | Playwright Platform`,
        description: t("choosePlanSubtitle"),
    }
}

export default async function PricingPage() {
    const session = await auth()

    // Fetch all active products
    const activeProducts = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))

    const userData = session?.user?.email ? await db.query.users.findFirst({
        where: eq(users.email, session.user.email)
    }) : null

    const currentRoleId = userData?.dynamicRoleId ?? null

    return (
        <PricingClient
            products={activeProducts}
            currentRoleId={currentRoleId}
            isAuthenticated={!!session?.user}
            userEmail={session?.user?.email}
        />
    )
}
