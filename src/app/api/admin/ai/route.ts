
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

        // Find the best available model that supports generation
        const availableModels = modelsData.models || []
        const supportedModels = availableModels.filter((m: any) =>
            m.supportedGenerationMethods?.includes("generateContent")
        )

        console.log(`Found ${supportedModels.length} supported models:`, supportedModels.map((m: any) => m.name).join(", "))

        if (supportedModels.length === 0) {
            throw new Error("No models available for this API key that support content generation. Please check if 'Generative Language API' is enabled in your Google project.")
        }

        // Prefer 1.5-flash, then 1.5-pro, then anything available
        const preferredModels = ["models/gemini-1.5-flash", "models/gemini-1.5-flash-latest", "models/gemini-1.5-pro", "models/gemini-pro"]
        let selectedModel = supportedModels[0].name

        for (const pref of preferredModels) {
            if (supportedModels.find((m: any) => m.name === pref)) {
                selectedModel = pref
                break
            }
        }

        console.log(`Using discovered model: ${selectedModel}`)

        // 2. Generate content using the discovered model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/${selectedModel}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
                })
            }
        )

        const result = await response.json()

        if (result.error) {
            throw new Error(`Gemini Generation Error (${selectedModel}): ${result.error.message}`)
        }

        const content = result.candidates?.[0]?.content?.parts?.[0]?.text

        if (!content) {
            throw new Error(`Model ${selectedModel} returned no content. Response: ${JSON.stringify(result)}`)
        }

        return NextResponse.json({ content })
    } catch (error: any) {
        console.error("Error generating AI content:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate content" },
            { status: 500 }
        )
    }
}
