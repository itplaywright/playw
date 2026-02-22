
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { prompt, type } = await req.json()

        let systemPrompt = ""
        let userPrompt = ""

        if (type === "description") {
            systemPrompt = `You are an expert Playwright automation instructor. 
            Generate a comprehensive and educational Markdown description for a learning task IN UKRAINIAN language.
            
            Structure:
            1. ## Title (with emoji)
            2. **Theory**: Explain the concept clearly. Why is it important? How does it work?
            3. **Example**: Provide a code block showing how to use the specific method/locator.
               ALWAYS start code blocks with:
               \`\`\`typescript
               import { test, expect } from '@playwright/test';
               
               test('example', async ({ page }) => {
                 // code here
               });
               \`\`\`
            4. ### Task: Clear instructions on what the student needs to do in the editor.
            
            Keep the tone encouraging and professional.
            Use formatting (bold, code blocks) to make it readable.`

            userPrompt = `Create a description for a task titled: "${prompt}".`
        }

        // 1. Collect all available API keys
        const apiKeys = [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3
        ].map(k => k?.trim()).filter(Boolean) as string[]

        if (apiKeys.length === 0) {
            return NextResponse.json(
                { error: "Google Gemini API Key not configured" },
                { status: 500 }
            )
        }

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
        let lastErrorMsg = ""
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        // Helper to shuffle array (Fisher-Yates)
        const shuffle = <T,>(array: T[]): T[] => {
            const result = [...array];
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        };

        // 2. Iterate through API keys
        for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
            const apiKey = apiKeys[keyIndex];
            const keyLabel = `Key #${keyIndex + 1}`;

            try {
                console.log(`AI: Checking available models for ${keyLabel}...`);
                const modelsResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
                );
                const modelsData = await modelsResponse.json();

                if (modelsData.error) {
                    console.warn(`AI: ${keyLabel} - Discovery Error: ${modelsData.error.message}`);
                    lastErrorMsg = `Помилка Discovery (${keyLabel}): ${modelsData.error.message}`;
                    continue; // Try next key
                }

                const supportedModels = (modelsData.models || []).filter((m: any) =>
                    m.supportedGenerationMethods?.includes("generateContent")
                ).map((m: any) => m.name);

                if (supportedModels.length === 0) {
                    console.warn(`AI: ${keyLabel} - No supported models found.`);
                    continue;
                }

                // 3. Define and shuffle models to try
                const preferredModelsOrder = [
                    "models/gemini-2.0-flash",
                    "models/gemini-2.0-flash-exp",
                    "models/gemini-2.0-flash-lite-preview-02-05",
                    "models/gemini-1.5-flash",
                    "models/gemini-1.5-flash-latest",
                    "models/gemini-1.5-flash-8b",
                    "models/gemini-1.5-pro",
                    "models/gemini-1.0-pro",
                    "models/gemini-pro"
                ].filter(m => supportedModels.includes(m));

                // Add any other supported models
                for (const m of supportedModels) {
                    if (!preferredModelsOrder.includes(m)) {
                        preferredModelsOrder.push(m);
                    }
                }

                // Shuffling helps distribute load on the free tier
                const modelsToTry = shuffle(preferredModelsOrder);
                console.log(`AI: ${keyLabel} - Fallback sequence (shuffled):`, modelsToTry.join(" -> "));

                // 4. Try models for this key
                for (const modelName of modelsToTry) {
                    for (let attempt = 1; attempt <= 2; attempt++) {
                        try {
                            if (attempt > 1) {
                                await delay(2000);
                                console.log(`AI: ${keyLabel} - Retrying ${modelName} (Attempt ${attempt})...`);
                            } else {
                                console.log(`AI: ${keyLabel} - Trying ${modelName}...`);
                            }

                            const response = await fetch(
                                `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        contents: [{ parts: [{ text: fullPrompt }] }]
                                    }),
                                    signal: AbortSignal.timeout(30000)
                                }
                            );

                            const result = await response.json();

                            if (result.error) {
                                const errorMsg = result.error.message || "Unknown error";
                                const isQuotaError = result.error.status === "RESOURCE_EXHAUSTED" || errorMsg.includes("quota");

                                console.warn(`AI: ${keyLabel} - ${modelName} failed on attempt ${attempt}: ${errorMsg}`);

                                if (isQuotaError) {
                                    lastErrorMsg = `Перевищено ліміт запитів (Quota) для всіх спробованих ключів та моделей.`;
                                    if (attempt === 1) continue; // Try retry
                                    break; // Try next model
                                }

                                lastErrorMsg = `Помилка ${modelName}: ${errorMsg}`;
                                break; // Try next model
                            }

                            const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (content) {
                                console.log(`AI: ${keyLabel} - Success with ${modelName}`);
                                return NextResponse.json({ content });
                            } else {
                                console.warn(`AI: ${keyLabel} - ${modelName} returned no content.`);
                                lastErrorMsg = `Модель ${modelName} повернула порожній результат.`;
                                break;
                            }
                        } catch (err: any) {
                            console.error(`AI: ${keyLabel} - ${modelName} connectivity error:`, err.message);
                            lastErrorMsg = `Помилка зв'язку: ${err.message}`;
                            if (attempt === 1) continue;
                            break;
                        }
                    }
                }

                console.warn(`AI: ${keyLabel} exhausted. Trying next API key if available...`);

            } catch (err: any) {
                console.error(`AI: Critical error with ${keyLabel}:`, err.message);
                lastErrorMsg = `Критична помилка ключа: ${err.message}`;
            }
        }

        // 5. All keys and models failed
        return NextResponse.json(
            { error: lastErrorMsg || "Всі AI моделі та ключі наразі недоступні через обмеження лімітів. Спробуйте через 10 хвилин." },
            { status: 500 }
        )
    } catch (error: any) {
        console.error("Critical AI Route Error:", error)
        return NextResponse.json(
            { error: "Сталася внутрішня помилка при з'єднанні з AI. Перевірте /api/diag або консоль." },
            { status: 500 }
        )
    }
}
