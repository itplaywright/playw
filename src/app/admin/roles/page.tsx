import { auth } from "@/lib/auth"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"
import RolesClient from "../../../components/admin/RolesClient"

export default async function AdminRolesPage() {
    try {
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
    } catch (error: any) {
        console.error("Error in AdminRolesPage:", error)
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl m-6 border border-red-100 shadow-sm">
                <h2 className="text-xl font-bold mb-2">Сталася помилка завантаження ролей</h2>
                <p className="text-sm opacity-80 mb-4">{error.message}</p>
                <div className="text-xs bg-white/50 p-4 rounded-xl text-left font-mono overflow-auto max-h-40">
                    {error.stack}
                </div>
            </div>
        )
    }
}
