import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import CabinetClient from "@/components/cabinet/CabinetClient"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function UserCabinetPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login?callbackUrl=/cabinet")
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CabinetClient user={session.user} />
        </Suspense>
    )
}
