import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// 500KB limit for Base64 storage to avoid DB bloating
const MAX_FILE_SIZE = 500 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]

export async function POST(req: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: "Invalid file type. Only PNG, JPG, and SVG are allowed"
            }, { status: 400 })
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: "File is too large. Max 500KB for Base64 storage."
            }, { status: 400 })
        }

        // Convert to Base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes) // Standard NodeJS Buffer
        const base64 = buffer.toString("base64")
        const dataUrl = `data:${file.type};base64,${base64}`

        // Return Data URL directly. The frontend will blindly save this string to the DB.
        return NextResponse.json({ url: dataUrl })
    } catch (error: any) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
