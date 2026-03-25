import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Import all tasks
import { level1Tasks } from "../src/db/data/level1_1"
import { level1Tasks_2 } from "../src/db/data/level1_2"
import { level1Tasks_3 } from "../src/db/data/level1_3"
import { level1Tasks_4 } from "../src/db/data/level1_4"
import { level2Tasks_1 } from "../src/db/data/level2_1"
import { level2Tasks_2 } from "../src/db/data/level2_2"
import { level2Tasks_3 } from "../src/db/data/level2_3"
import { level3Tasks_1 } from "../src/db/data/level3_1"
import { level3Tasks_2 } from "../src/db/data/level3_2"
import { level4Tasks_1 } from "../src/db/data/level4_1"
import { level4Tasks_2 } from "../src/db/data/level4_2"
import { level5Tasks_1 } from "../src/db/data/level5_1"
import { level5Tasks_2 } from "../src/db/data/level5_2"
import { level6Tasks } from "../src/db/data/level6_1"

dotenv.config({ path: ".env.local" })

const allTasks = [
    ...level1Tasks, ...level1Tasks_2, ...level1Tasks_3, ...level1Tasks_4,
    ...level2Tasks_1, ...level2Tasks_2, ...level2Tasks_3,
    ...level3Tasks_1, ...level3Tasks_2,
    ...level4Tasks_1, ...level4Tasks_2,
    ...level5Tasks_1, ...level5Tasks_2,
    ...level6Tasks
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function generateQuizzes() {
    console.log(`⏳ Starting quiz generation for ${allTasks.length} tasks...`)
    
    const outputFilePath = path.join(__dirname, "../src/db/data/quiz-questions.json")
    let existingData: Record<string, any[]> = {}
    
    if (fs.existsSync(outputFilePath)) {
        existingData = JSON.parse(fs.readFileSync(outputFilePath, "utf8"))
        console.log(`Loaded existing data with ${Object.keys(existingData).length} task quizzes.`)
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing!")
        return
    }

    let successCount = 0;
    
    for (let i = 0; i < allTasks.length; i++) {
        const task = allTasks[i]
        
        // Skip if we already successfully generated 4 questions for this task
        if (existingData[task.title] && existingData[task.title].length === 4) {
            console.log(`[${i+1}/${allTasks.length}] Skipping ${task.title} (already exists)`)
            continue
        }

        console.log(`[${i+1}/${allTasks.length}] Generating for: ${task.title}...`)
        
        const prompt = `
You are an expert Playwright automation instructor.
Given the following lesson theory, generate exactly 4 distinct multiple-choice quiz questions to test the learner's understanding.
Language: Ukrainian.

Lesson Theory:
${task.description.substring(0, 1500)} // truncate to save tokens just in case

Rules:
1. Output ONLY a valid JSON array of objects. NO markdown blocks like \`\`\`json.
2. Format:
[
  {
    "text": "Question 1 text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  },
  ...
]
3. Exactly 4 options per question.
4. "correctAnswer" MUST exactly match one string from "options".
5. Questions must be challenging but answerable from the text.
`

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            )

            const data = await response.json()
            if (data.error) {
                console.error(`Error from Gemini:`, data.error.message)
                await delay(5000)
                continue
            }

            let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!rawResponse) {
                console.log("Empty response.")
                continue
            }

            // Cleanup potential markdown
            rawResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim()
            
            const questions = JSON.parse(rawResponse)
            
            if (!Array.isArray(questions) || questions.length !== 4) {
                console.log("Invalid format or not 4 questions. Skipping.")
                continue
            }

            existingData[task.title] = questions
            
            // Save midway to avoid losing progress
            fs.writeFileSync(outputFilePath, JSON.stringify(existingData, null, 2))
            successCount++;
            
            console.log(`✅ Success for ${task.title}`)
            await delay(3500) // Rate limit prevention

        } catch (e: any) {
            console.error(`❌ Exception for ${task.title}:`, e.message)
            await delay(5000)
        }
    }
    
    console.log(`\n🎉 Finished! Generated new quizzes for ${successCount} tasks. Total robust tasks now: ${Object.keys(existingData).length}.`)
}

generateQuizzes()
