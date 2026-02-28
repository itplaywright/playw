import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import fs from "fs"
import path from "path"
import os from "os"
import { exec } from "child_process"
import { promisify } from "util"
import { db } from "@/db"
import { results } from "@/db/schema"
import vm from "node:vm"

const execAsync = promisify(exec)

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let taskId: number | undefined;
    try {
        const json = await req.json();
        const code = json.code;
        taskId = json.taskId;

        // HYBRID APPROACH:
        // Local Dev: Use visible 'tests-runtime' so user can open it in VS Code
        // Production (Netlify): Use os.tmpdir() because other paths are Read-Only
        const isDev = process.env.NODE_ENV !== "production";

        let runtimeDir: string;
        if (isDev) {
            runtimeDir = path.join(process.cwd(), "tests-runtime");
        } else {
            // Unique dir per request to avoid collisions in concurrent Lambda executions
            runtimeDir = path.join(os.tmpdir(), "itplatform-tests", `request-${Date.now()}-${Math.random()}`);
        }

        if (!fs.existsSync(runtimeDir)) {
            fs.mkdirSync(runtimeDir, { recursive: true })
        }

        // We use a fixed filename 'active.spec.ts' in DEV for ease of use.
        // In PROD, we use the specific directory created above.
        const testFilePath = path.join(runtimeDir, "active.spec.ts")
        const configFilePath = path.join(runtimeDir, "playwright.config.ts")
        fs.writeFileSync(testFilePath, code)

        // Generate temporary config to ensure Playwright looks in the right place
        // and doesn't rely on project-level config which might ignore temp dirs
        const browserServiceUrl = process.env.BROWSER_SERVICE_URL
        const configContent = `
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './',
  use: {
    ${browserServiceUrl ? `connectOptions: { wsEndpoint: '${browserServiceUrl}' },` : ''}
    headless: true,
  },
  reporter: 'line',
});`
        fs.writeFileSync(configFilePath, configContent)

        let status: "passed" | "failed" = "failed"
        let logs = ""

        try {
            // Fix for Windows paths: Playwright/Shell often requires forward slashes or strict escaping
            const safeTestFilePath = testFilePath.replace(/\\/g, "/")
            const safeConfigFilePath = configFilePath.replace(/\\/g, "/")
            const nodeModulesPath = path.join(process.cwd(), "node_modules")

            // ALWAYS use the custom config to ensure isolation
            const configArg = `--config="${safeConfigFilePath}"`

            // In production without a service URL, we MUST use mock mode to avoid 500
            if (process.env.NODE_ENV === "production" && !browserServiceUrl) {
                throw new Error("MOCK_MODE")
            }


            // Debug logging
            console.log("Test file path:", safeTestFilePath)
            console.log("File exists:", fs.existsSync(testFilePath)) // Check original path for existence
            const command = `npx playwright test "${safeTestFilePath}" ${configArg} --reporter=line`
            console.log("Executing command:", command)

            const { stdout, stderr } = await execAsync(command, {
                env: {
                    ...process.env,
                    NODE_PATH: nodeModulesPath, // Allow finding modules from project root
                    npm_config_cache: path.join(os.tmpdir(), ".npm"), // Fix for Netlify/Lambda read-only home
                }
            })
            logs = stdout || stderr
            status = "passed"
        } catch (error: any) {
            if (error.message === "MOCK_MODE" || (process.env.NODE_ENV === "production" && !browserServiceUrl)) {
                logs = "Running in Production Mock Mode (Set BROWSER_SERVICE_URL for real execution)...\n"

                const validationResult = validatePlaywrightCode(code);

                if (validationResult.isValid) {
                    console.log("Validation passed for code:", code.substring(0, 100));
                    logs += "✓ Playwright commands detected\n✓ Advanced syntax validation passed\n\nResult: Passed (Simulated)"
                    status = "passed"
                } else {
                    logs += `✗ Error: ${validationResult.error}\n\nResult: Failed`
                    status = "failed"
                }
            } else {
                logs = error.stdout || error.stderr || error.message
                status = "failed"
            }
        }

        // Sanitize logs: remove ANSI escape codes
        const sanitizedLogs = logs ? logs.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim() : "";

        try {
            // Save result to DB
            const payload = {
                userId: session.user.id,
                taskId: taskId ? Number(taskId) : null,
                status: status,
                logs: sanitizedLogs,
            }
            await db.insert(results).values(payload);
        } catch (dbError: any) {
            console.error("--- DATABASE INSERT FAILED ---");
            console.error("Payload:", {
                userId: session.user.id,
                taskId: taskId,
                status,
                logLength: sanitizedLogs?.length
            })
            console.error("DB Error Message:", dbError.message);
            // Non-critical: we still return 200 with logs even if DB logging fails
        }

        // Cleanup - DISABLED so user can see the file in VS Code
        // try {
        //     fs.rmSync(runtimeDir, { recursive: true, force: true })
        // } catch (e) {
        //     console.error("Cleanup error:", e)
        // }

        return NextResponse.json({ logs: sanitizedLogs, status })
    } catch (error: any) {
        console.error("--- CRITICAL TASK EXECUTION ERROR ---")
        console.error("Context:", { taskId, userId: session.user.id })
        console.error("Error Message:", error.message)
        console.error("--------------------------------------")
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
    }
}

function validatePlaywrightCode(code: string): { isValid: boolean, error?: string } {
    // 1. Basic Syntax Check using VM
    // Strip import/export lines first — vm.Script runs as CommonJS script, 
    // so it rejects ES module syntax even if the code is valid Playwright test code.
    const codeForSyntaxCheck = code
        .split('\n')
        .filter(line => !line.trim().startsWith('import ') && !line.trim().startsWith('export '))
        .join('\n');

    try {
        new vm.Script(codeForSyntaxCheck);
    } catch (e: any) {
        return { isValid: false, error: `JS Syntax Error: ${e.message}` };
    }

    // 2. Standalone function call validation (catches tedd(), expectt(), etc.)
    // Extract standalone function calls (not preceded by a dot, so not method calls)
    const standaloneFnRegex = /(?<![.\w])([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const allowedStandaloneFns = new Set([
        'test', 'expect', 'describe', 'it', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll',
        'require', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
        'Promise', 'parseInt', 'parseFloat', 'JSON', 'Math', 'Date', 'String', 'Number', 'Boolean', 'Array', 'Object'
    ]);
    const knownKeywords = ['test', 'expect', 'describe', 'it'];

    let fnMatch;
    const standaloneCalls: string[] = [];
    const reStandalone = /(?<![.\w])([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    // Only check code without import/export lines
    const codeLines = code.split('\n').filter(l => !l.trim().startsWith('import ') && !l.trim().startsWith('export '));
    const codeForFnCheck = codeLines.join('\n');

    while ((fnMatch = reStandalone.exec(codeForFnCheck)) !== null) {
        const fn = fnMatch[1];
        // Skip if it's a known allowed function or starts with uppercase (constructor)
        if (/^[A-Z]/.test(fn)) continue;
        if (allowedStandaloneFns.has(fn)) continue;
        // Check if it looks like a typo of a known keyword (similar length, 1-2 chars different)
        for (const kw of knownKeywords) {
            if (Math.abs(fn.length - kw.length) <= 2) {
                // Simple character similarity check
                let matches = 0;
                const shorter = fn.length < kw.length ? fn : kw;
                const longer = fn.length < kw.length ? kw : fn;
                for (let i = 0; i < shorter.length; i++) {
                    if (longer.includes(shorter[i])) matches++;
                }
                const similarity = matches / longer.length;
                if (similarity > 0.5) {
                    return { isValid: false, error: `Unknown function "${fn}". Did you mean "${kw}"?` };
                }
            }
        }
    }

    // 3. Keyword suffix typo check (awaits, expectt, etc.)
    const keywords = ['await', 'expect', 'test', 'async'];
    const codeAllLines = code.split('\n');
    for (const line of codeAllLines) {
        for (const kw of keywords) {
            const typoRegex = new RegExp(`\\b${kw}[a-z]+\\b`, 'gi');
            const match = line.match(typoRegex);
            if (match) {
                const found = match[0].toLowerCase();
                if (found !== kw) {
                    return { isValid: false, error: `Unknown keyword "${found}". Did you mean "${kw}"?` };
                }
            }
        }
    }

    const commonMethods = [
        // Page actions
        'goto', 'click', 'fill', 'press', 'check', 'uncheck', 'selectOption', 'hover', 'focus', 'type', 'screenshot', 'waitForSelector', 'waitForLoadState', 'setContent', 'reload', 'goBack', 'goForward',
        // Locators
        'locator', 'getByRole', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByAltText', 'getByTitle', 'getByTestId', 'frameLocator',
        // Assertions (web first)
        'toBeAttached', 'toBeChecked', 'toBeDisabled', 'toBeEditable', 'toBeEmpty', 'toBeEnabled', 'toBeFocused', 'toBeHidden', 'toBeInViewport', 'toBeVisible',
        'toContainText', 'toHaveAttribute', 'toHaveClass', 'toHaveCount', 'toHaveCSS', 'toHaveId', 'toHaveJSProperty', 'toHaveText', 'toHaveValue', 'toHaveValues',
        'toHaveTitle', 'toHaveURL', 'toBeOK',
        // Standard Jest/Playwright matchers
        'toBe', 'toEqual', 'toContain', 'toBeTruthy', 'toBeFalsy', 'toBeNull', 'toBeDefined', 'toBeUndefined', 'toMatch', 'toHaveLength', 'toHaveProperty', 'toBeGreaterThan', 'toBeLessThan'
    ];

    // Check for obvious Playwright usage
    const hasExpect = /expect\s*\(/.test(code);
    const hasTest = /test\s*\(/.test(code);
    const hasPage = /page\./.test(code);

    if (!hasExpect && !hasTest && !hasPage) {
        return { isValid: false, error: "No active Playwright commands found." };
    }

    // Extract all method calls: .something(
    const methodCallRegex = /\.\s*([a-zA-Z0-9_]+)\s*\(/g;
    let match;
    const detectedMethods: string[] = [];

    while ((match = methodCallRegex.exec(code)) !== null) {
        const methodName = match[1];
        // Ignore internal or common JS methods that are not strictly Playwright
        if (['then', 'catch', 'finally', 'json', 'log', 'error', 'warn', 'stringify', 'parse', 'push', 'pop', 'shift', 'unshift', 'map', 'filter', 'reduce'].includes(methodName)) continue;
        detectedMethods.push(methodName);
    }

    // Validate methods against whitelist
    for (const method of detectedMethods) {
        if (!commonMethods.includes(method)) {
            // Check for common typos or case sensitivity issues
            const suggestion = commonMethods.find(m => m.toLowerCase() === method.toLowerCase());
            if (suggestion) {
                return { isValid: false, error: `Unknown method "${method}". Did you mean "${suggestion}"?` };
            }

            return { isValid: false, error: `Unknown or disallowed method "${method}".` };
        }
    }

    return { isValid: true };
}

