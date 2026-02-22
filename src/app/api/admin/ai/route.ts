
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { prompt, type } = await req.json()

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Google Gemini API Key not configured" },
                { status: 500 }
            )
        }

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

        const apiKey = process.env.GEMINI_API_KEY!.trim()
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

        // 1. Discover available models for this specific API key
        console.log("Discovering available Gemini models...");
        const modelsResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        )
        const modelsData = await modelsResponse.json()

        if (modelsData.error) {
            throw new Error(`Gemini API Discovery Error: ${modelsData.error.message} (${modelsData.error.status})`)
        }

        // Find the best available models that support generation
        const availableModels = modelsData.models || []
        const supportedModels = availableModels.filter((m: any) =>
            m.supportedGenerationMethods?.includes("generateContent")
        )

        console.log(`Found ${supportedModels.length} supported models:`, supportedModels.map((m: any) => m.name).join(", "))

        if (supportedModels.length === 0) {
            throw new Error("No models available for this API key that support content generation.")
        }

        // Define our preferred models in order of preference
        const preferredModelsOrder = [
            "models/gemini-2.0-flash",
            "models/gemini-2.0-flash-exp",
            "models/gemini-2.0-flash-lite-preview-02-05",
            "models/gemini-1.5-flash",
            "models/gemini-1.5-flash-latest",
            "models/gemini-1.5-pro",
            "models/gemini-pro"
        ]

        // Create an ordered list of models to try based on availability and preference
        const modelsToTry: string[] = []

        // First, add models from our preference list that are actually available
        for (const pref of preferredModelsOrder) {
            if (supportedModels.find((m: any) => m.name === pref)) {
                modelsToTry.push(pref)
            }
        }

        // Then, add any other supported models we haven't included yet
        for (const m of supportedModels) {
            if (!modelsToTry.includes(m.name)) {
                modelsToTry.push(m.name)
            }
        }

        console.log("Fallback sequence:", modelsToTry.join(" -> "))

        let lastError = null
        let content = null

        // 2. Try models in sequence until one succeeds
        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}`)
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: fullPrompt }] }]
                        }),
                        signal: AbortSignal.timeout(30000) // 30s timeout
                    }
                )

                const result = await response.json()

                if (result.error) {
                    const errorMsg = result.error.message || "Unknown error"
                    const isQuotaError = result.error.status === "RESOURCE_EXHAUSTED" || errorMsg.includes("quota")

                    console.warn(`Model ${modelName} failed: ${errorMsg} (${result.error.status})`)

                    if (isQuotaError) {
                        lastError = new Error(`Quota exceeded for ${modelName}. Trying next model...`)
                        continue // Try next model
                    }

                    throw new Error(`Gemini Generation Error (${modelName}): ${errorMsg}`)
                }

                content = result.candidates?.[0]?.content?.parts?.[0]?.text
                if (content) {
                    console.log(`Successfully generated content using ${modelName}`)
                    return NextResponse.json({ content })
                } else {
                    console.warn(`Model ${modelName} returned empty content.`)
                    lastError = new Error(`Model ${modelName} returned no content.`)
                }
            } catch (err: any) {
                console.error(`Error with model ${modelName}:`, err.message)
                lastError = err
                // If it's a timeout or network error, it's worth trying the next model
                continue
            }
        }

        // 3. If we reached here, all models failed
        throw lastError || new Error("All AI models failed to generate content.")
    } catch (error: any) {
        console.error("Error generating AI content:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate content" },
            { status: 500 }
        )
    }
}
