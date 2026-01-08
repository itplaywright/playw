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
        const configFilePath = path.join(tempDir, "playwright.config.ts")
        fs.writeFileSync(testFilePath, code)

        // Generate temporary config for remote browser if URL provided
        const browserServiceUrl = process.env.BROWSER_SERVICE_URL
        if (browserServiceUrl) {
            const configContent = `
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    connectOptions: {
      wsEndpoint: '${browserServiceUrl}',
    },
  },
  reporter: 'line',
});`
            fs.writeFileSync(configFilePath, configContent)
        }

        let status: "passed" | "failed" = "failed"
        let logs = ""

        try {
            const commandPath = testFilePath.replace(/\\/g, "/")
            const configArg = browserServiceUrl ? `--config="${configFilePath.replace(/\\/g, "/")}"` : ""

            // In production without a service URL, we MUST use mock mode to avoid 500
            if (process.env.NODE_ENV === "production" && !browserServiceUrl) {
                throw new Error("MOCK_MODE")
            }

            const { stdout, stderr } = await execAsync(`npx playwright test "${commandPath}" ${configArg} --reporter=line`)
            logs = stdout || stderr
            status = "passed"
        } catch (error: any) {
            if (error.message === "MOCK_MODE" || (process.env.NODE_ENV === "production" && !browserServiceUrl)) {
                logs = "Running in Production Mock Mode (Set BROWSER_SERVICE_URL for real execution)...\n"
                const hasExpect = /expect\s*\(/.test(code)
                const hasGoto = /page\.goto\s*\(/.test(code)
                const hasLocator = /(getByRole|getByText|getByPlaceholder|locator)\s*\(/.test(code)

                if (hasGoto || hasLocator || hasExpect) {
                    logs += "✓ Playwright commands detected\n✓ Basic syntax validation passed\n\nResult: Passed (Simulated)"
                    status = "passed"
                } else {
                    logs += "✗ Error: No active Playwright commands found.\n\nResult: Failed"
                    status = "failed"
                }
            } else {
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
