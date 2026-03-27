import { auth } from "@/lib/auth"
import { db } from "@/db"
import { accessCodes, products } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc, asc } from "drizzle-orm"
import AccessCodesClient from "../../../components/admin/AccessCodesClient"

export const dynamic = "force-dynamic"


export default async function AdminAccessCodesPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    const allProducts = await db.select().from(products).orderBy(asc(products.title))

    return (
        <div className="p-6">
            <AccessCodesClient products={allProducts} />
        </div>
    )
}
