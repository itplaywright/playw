import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserCertificates } from "@/lib/certificates"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const certs = await getUserCertificates(session.user.id)
        return NextResponse.json({ certificates: certs })
    } catch (error: any) {
        console.error("Certificates API error:", error.message)
        return NextResponse.json({ error: "Failed to load certificates" }, { status: 500 })
    }
}
