import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products, roles } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc, asc } from "drizzle-orm"
import ProductsClient from "../../../components/admin/ProductsClient"

export default async function AdminProductsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt))
    const allRoles = await db.select().from(roles).orderBy(asc(roles.name))

    return (
        <div className="p-6">
            <ProductsClient initialProducts={allProducts} roles={allRoles} />
        </div>
    )
}
