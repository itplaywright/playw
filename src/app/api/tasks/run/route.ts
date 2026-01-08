
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { db } from "@/db"
import { results } from "@/db/schema"

const execAsync = promisify(exec)

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { code, taskId } = await req.json()

        // Create a temporary directory for the test
        const tempDir = path.join(process.cwd(), "temp-tests", `user-${session.user.id}-${Date.now()}`)
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }

        const testFilePath = path.join(tempDir, "user.spec.ts")
        fs.writeFileSync(testFilePath, code)

        let status: "passed" | "failed" = "failed"
        let logs = ""

        try {
            const commandPath = testFilePath.replace(/\\/g, "/")
            const { stdout, stderr } = await execAsync(`npx playwright test "${commandPath}" --reporter=line`)
            logs = stdout || stderr
            status = "passed"
        } catch (error: any) {
            logs = error.stdout || error.stderr || error.message
            status = "failed"
        }

        // Save result to DB
        await db.insert(results).values({
            userId: session.user.id,
            taskId: taskId,
            status: status,
            logs: logs,
        })

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true })

        return NextResponse.json({ logs, status })
    } catch (error: any) {
        console.error("Execution error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
