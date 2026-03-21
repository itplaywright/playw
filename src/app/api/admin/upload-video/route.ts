import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("video") as File
        const taskId = formData.get("taskId") as string

        if (!file || !taskId) {
            return NextResponse.json({ error: "Відео або taskId відсутній" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Save to public/videos/
        const videosDir = path.join(process.cwd(), "public", "videos")
        await mkdir(videosDir, { recursive: true })

        const filename = `task-${taskId}.webm`
        const filepath = path.join(videosDir, filename)
        await writeFile(filepath, buffer)

        const url = `/videos/${filename}`
        return NextResponse.json({ url })

    } catch (err: any) {
        console.error("Upload error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
