
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { prompt, type } = await req.json()

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API Key not configured" },
                { status: 500 }
            )
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        let systemPrompt = ""
        let userPrompt = ""

        if (type === "description") {
            systemPrompt = `You are an expert Playwright automation instructor. 
            Generate a concise, engaging, and educational Markdown description for a learning task. 
            Structure:
            1. ## Title (with emoji)
            2. Short explanation of the concept (Why it's important).
            3. ### Task (What the student needs to do).
            4. Keep it under 200 words.
            5. Use formatting (bold, code blocks) to make it readable.`

            userPrompt = `Create a description for a task titled: "${prompt}".`
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "gpt-4o-mini",
        })

        const content = completion.choices[0].message.content

        return NextResponse.json({ content })
    } catch (error: any) {
        console.error("Error generating AI content:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate content" },
            { status: 500 }
        )
    }
}
