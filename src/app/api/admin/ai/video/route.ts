import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import * as googleTTS from "google-tts-api"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || (session.user as any).role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { taskId, title, description, initialCode } = await req.json()

        const systemPrompt = `Ти - експерт-викладач з Playwright та автоматизації тестування.
Твоє завдання - написати КОРОТКИЙ і ЗРОЗУМІЛИЙ текст для озвучки навчального відео українською мовою.

Правила:
- Мова: виключно українська
- Довжина: 150-250 слів (щоб озвучка тривала ~60-90 секунд)
- Стиль: дружній, чіткий, як пояснення ментора студенту
- Структура: 1) Про що це завдання (2-3 речення), 2) Пояснення ключових концепцій коду (3-5 речень), 3) Що потрібно зробити студенту (2-3 речення)
- НЕ використовуй markdown, зірочки, решітки — тільки звичайний текст для озвучки
- НЕ читай код буквально — пояснюй ЩО він робить
- Починай з "У цьому завданні..."
`

        const userPrompt = `Назва завдання: "${title}"

Опис завдання:
${description?.substring(0, 500) || "Немає опису"}

Початковий код:
${initialCode?.substring(0, 800) || "Немає коду"}

Напиши текст для озвучки відео.`

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

        const apiKeys = [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3
        ].map(k => k?.trim()).filter(Boolean) as string[]

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "Gemini API Key не налаштований" }, { status: 500 })
        }

        let lastError = ""

        for (const apiKey of apiKeys) {
            try {
                // Discover available models
                const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
                const modelsData = await modelsRes.json()

                if (modelsData.error) {
                    lastError = modelsData.error.message
                    continue
                }

                const models = (modelsData.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                    .map((m: any) => m.name)

                const preferred = [
                    "models/gemini-2.0-flash",
                    "models/gemini-1.5-flash",
                    "models/gemini-1.5-flash-latest",
                    "models/gemini-1.5-flash-8b",
                    "models/gemini-1.5-pro",
                ].filter(m => models.includes(m))

                for (const other of models) {
                    if (!preferred.includes(other)) preferred.push(other)
                }

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
                        const script = data.candidates?.[0]?.content?.parts?.[0]?.text
                        if (script) {
                            // 2. Generate Audio via Google Translate TTS
                            try {
                                const results = await googleTTS.getAllAudioBase64(script, {
                                    lang: 'uk',
                                    slow: false,
                                    host: 'https://translate.google.com',
                                    splitPunct: ',.?',
                                })

                                // Concatenate all base64 chunks into one MP3 buffer
                                const buffers = results.map(res => Buffer.from(res.base64, 'base64'))
                                const finalBuffer = Buffer.concat(buffers)

                                // 3. Upload to Vercel Blob
                                const filename = `task-videos/task-${taskId || "new-" + Date.now()}.mp3`
                                const blob = await put(filename, finalBuffer, {
                                    access: "public",
                                    contentType: "audio/mpeg",
                                })

                                return NextResponse.json({
                                    script,
                                    videoUrl: blob.url
                                })
                            } catch (ttsErr: any) {
                                console.error("TTS or Upload Error:", ttsErr)
                                return NextResponse.json({ error: "Скрипт згенеровано, але помилка озвучки: " + ttsErr.message }, { status: 500 })
                            }
                        }
                        lastError = data.error?.message || "Порожня відповідь"
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
