import { auth } from "@/lib/auth"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"
import RolesClient from "@/components/admin/RolesClient"

export default async function AdminRolesPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))

    return (
        <div className="p-6">
            <RolesClient initialRoles={allRoles} />
        </div>
    )
}
