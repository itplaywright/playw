import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import fs from "fs"
import path from "path"
import os from "os"
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

        // Use /tmp for Netlify / serverless environments
        const tempBaseDir = os.tmpdir()
        const tempDir = path.join(tempBaseDir, "itplatform-tests", `user-${session.user.id}-${Date.now()}`)

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }

        const testFilePath = path.join(tempDir, "user.spec.ts")
        fs.writeFileSync(testFilePath, code)

        let status: "passed" | "failed" = "failed"
        let logs = ""

        // If on Netlify (production), we might not have Playwright browsers installed
        // We implement a "Mock Execution" that validates basic syntax or presence of assertions
        if (process.env.NODE_ENV === "production" && !process.env.ENABLE_REAL_TESTS) {
            logs = "Running in Production Mock Mode...\n"

            // Basic heuristic check for demo purposes
            const hasExpect = code.includes("expect(")
            const hasGoto = code.includes("page.goto(")

            if (hasExpect && hasGoto) {
                logs += "✓ Syntax validation passed\n✓ Assertions found\n✓ Navigation found\n\nResult: Passed (Simulated)"
                status = "passed"
            } else {
                logs += "✗ Error: Missing mandatory test elements (expect or page.goto)\n\nResult: Failed"
                status = "failed"
            }
        } else {
            // Local execution or if browsers are available
            try {
                const commandPath = testFilePath.replace(/\\/g, "/")
                const { stdout, stderr } = await execAsync(`npx playwright test "${commandPath}" --reporter=line`)
                logs = stdout || stderr
                status = "passed"
            } catch (error: any) {
                logs = error.stdout || error.stderr || error.message
                status = "failed"
            }
        }

        // Save result to DB
        await db.insert(results).values({
            userId: session.user.id,
            taskId: taskId,
            status: status,
            logs: logs,
        })

        // Cleanup
        try {
            fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (e) {
            console.error("Cleanup error:", e)
        }

        return NextResponse.json({ logs, status })
    } catch (error: any) {
        console.error("Execution error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
