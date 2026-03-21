import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { code, taskId } = await req.json()

        if (!code || !taskId) {
            return new NextResponse("Missing code or taskId", { status: 400 })
        }

        // Fetch task description for context
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId),
            columns: { title: true, description: true }
        })

        if (!task) {
            return new NextResponse("Task not found", { status: 404 })
        }

        const systemPrompt = `Ти - Senior QA Automation Engineer (Tech Lead) з Playwright. 
Твоє завдання - зробити Code Review коду студента, який він написав для виконання практичного завдання.

ПРАВИЛА ТВОГО REVIEW:
1. Будь суворим, але дружнім і професійним (використовуй емодзі).
2. Обов'язково звертай увагу на Best Practices Playwright: 
   - Використання locators (\`page.locator\`, \`page.getByRole\`) замість застарілих селекторів (\`page.$()\`).
   - Відсутність hardcoded \`page.waitForTimeout()\`.
   - Наявність правильних Assertions (\`expect()\`).
   - Використання web-first assertions (\`await expect(locator).toBeVisible()\`).
   - Перевір чи використав студент правильні async/await.
3. Структура твоєї відповіді (формат Markdown):
   - **🎯 Загальне враження** (1-2 речення)
   - **✅ Що зроблено добре** (маркований список)
   - **❌ Що треба виправити / Покращення** (маркований список з прикладами фрагментів коду)
4. Не пиши готовий ідеальний код повністю замість студента, лише показуй невеликі фрагменти-підказки.

Контекст завдання:
Назва: ${task.title}
Опис завдання (частина): ${task.description.substring(0, 1000)}
`

        const userPrompt = `Ось написаний мною код:
\`\`\`typescript
${code}
\`\`\`
Зроби Code Review.`

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

        const apiKeys = [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3
        ].map(k => k?.trim()).filter(Boolean) as string[]

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "API ключі Gemini не налаштовані" }, { status: 500 })
        }

        let lastError = ""

        for (const apiKey of apiKeys) {
            try {
                // Discover models
                const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
                const modelsData = await modelsRes.json()

                if (modelsData.error) {
                    lastError = modelsData.error.message
                    continue
                }

                const modelsArr = (modelsData.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                    .map((m: any) => m.name)

                const preferred = [
                    "models/gemini-2.0-flash",
                    "models/gemini-1.5-flash",
                    "models/gemini-1.5-pro",
                ].filter(m => modelsArr.includes(m))

                if (preferred.length === 0) continue;
                const model = preferred[0]

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
                        signal: AbortSignal.timeout(30000)
                    }
                )
                const data = await res.json()
                const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text

                if (reviewText) {
                    return NextResponse.json({ review: reviewText })
                }
                lastError = data.error?.message || "Порожня відповідь від ШІ"
            } catch (err: any) {
                lastError = err.message
            }
        }

        return NextResponse.json({ error: lastError || "Всі моделі недоступні" }, { status: 500 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
