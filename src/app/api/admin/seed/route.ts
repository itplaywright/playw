
import { auth } from "@/lib/auth"
// import { seedDatabase } from "@/db/seed-data"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // await seedDatabase()
        return NextResponse.json({
            success: false,
            message: "Automatic seeding is disabled to protect manual edits. Please add tasks manually."
        }, { status: 403 })
    } catch (error) {
        console.error("Error seeding database:", error)
        return NextResponse.json(
            { success: false, error: "Failed to seed database" },
            { status: 500 }
        )
    }
}
