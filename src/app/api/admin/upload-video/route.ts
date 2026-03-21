import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

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

        const filename = `task-videos/task-${taskId}.webm`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: "public",
            contentType: "audio/webm",
        })

        return NextResponse.json({ url: blob.url })

    } catch (err: any) {
        console.error("Upload error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
