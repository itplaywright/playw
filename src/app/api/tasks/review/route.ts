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
Твоє завдання - зробити Code Review коду студента, який він написав для виконання практичного завдання платформи курсу.

ПРАВИЛА ТВОГО REVIEW:
1. Пиши як реальна жива людина (досвідчений ментор).
2. КАТЕГОРИЧНО ЗАБОРОНЕНО використовувати будь-які емодзі (ніде у тексті).
3. Будь лаконічним, професійним та конструктивним. Спілкуйся українською мовою.
4. Звертай увагу на Best Practices Playwright: 
   - Використання locators (\`page.locator\`, \`page.getByRole\`) замість застарілих селекторів (\`page.$()\`).
   - Відсутність hardcoded \`page.waitForTimeout()\`.
   - Наявність правильних Assertions (\`expect()\`).
   - Використання web-first assertions (\`await expect(locator).toBeVisible()\`).
   - Правильне використання async/await.
5. Структура твоєї відповіді (формат Markdown):
   - Загальний коментар по роботі (1-2 речення).
   - Що зроблено добре (якщо є).
   - Що треба виправити (з коротким поясненням причини).
6. Не пиши готовий ідеальний код ідеального рішення, лише показуй невеликі фрагменти-підказки що треба виправити. Якщо помилок зовсім немає - просто скажи що код супер і можна йти далі.
7. ПЕРШИМ РЯДКОМ твоєї відповіді (перед будь-яким іншим текстом) напиши техічне слово: 
   - Напиши "STATUS: SAFE" якщо код ідеальний і виправляти нічого не треба.
   - Напиши "STATUS: ISSUES" якщо є зауваження до коду.
   (Цей рядок буде приховано від студента, він потрібен для логіки інтерфейсу).

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

        // Shuffle keys to distribute load
        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);

        for (const apiKey of shuffledKeys) {
            try {
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
                    "models/gemini-1.5-flash-latest",
                    "models/gemini-1.5-flash-8b",
                    "models/gemini-1.5-pro",
                ].filter(m => modelsArr.includes(m))

                // If preferred is empty, just use whatever text-generation models are available
                for (const other of modelsArr) {
                    if (!preferred.includes(other)) preferred.push(other)
                }

                if (preferred.length === 0) continue;

                // Shuffle preferred models so we don't always spam gemini-2.0-flash simultaneously
                // Actually, let's keep the priority but just loop over them
                for (const model of preferred) {
                    try {
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
                        if (res.status === 429) {
                            lastError = `Rate limit on ${model}. ` + (data.error?.message || "")
                            // Break out of model loop and try NEXT API KEY?
                            // Actually, quota is usually per-project, so trying different models on same key MIGHT work if the quota is per-model.
                            // We will continue the model loop.
                            continue;
                        }

                        lastError = data.error?.message || "Порожня відповідь від ШІ"

                        // If it's a 400 Bad Request, we probably shouldn't try other models with the same prompt, but 500s we should.
                    } catch (err: any) {
                        lastError = err.message
                    }
                }
            } catch (err: any) {
                lastError = err.message
            }
        }

        return NextResponse.json({ error: lastError || "Всі моделі недоступні" }, { status: 500 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
