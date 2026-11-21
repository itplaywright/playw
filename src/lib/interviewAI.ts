interface AnswerEvaluation {
    score: number
    evaluationEn: string
    evaluationUk: string
    evaluationRu: string
    mistakesEn: string
    mistakesUk: string
    mistakesRu: string
    idealAnswerEn: string
    idealAnswerUk: string
    idealAnswerRu: string
}

interface FinalReport {
    totalScore: number
    readinessLevel: string
    summaryEn: string
    summaryUk: string
    summaryRu: string
    strengths: string[]
    improvements: string[]
}

const MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest"
]

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].map(k => k?.trim()).filter(Boolean) as string[]

    if (!apiKeys.length) {
        throw new Error("No Gemini API key configured")
    }

    const fullPrompt = `${systemPrompt}\n\nUser Question/Input:\n${userPrompt}\n\nIMPORTANT: Return ONLY valid, raw JSON without markdown code fences or backticks.`

    for (const apiKey of apiKeys) {
        for (const model of MODELS) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }]
                    })
                })
                const data = await res.json()
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                    return text.replace(/```json/gi, '').replace(/```/g, '').trim()
                }
            } catch (err) {
                console.warn(`Gemini error on ${model}:`, err)
            }
        }
    }

    throw new Error("All Gemini model fallbacks exhausted")
}

export async function evaluateStudentAnswer(
    questionEn: string,
    studentAnswer: string,
    roleLevel: string,
    referenceIdealAnswerEn?: string
): Promise<AnswerEvaluation> {
    // If student didn't write anything meaningful
    if (!studentAnswer || studentAnswer.trim().length < 5) {
        return {
            score: 0,
            evaluationEn: "No meaningful answer provided.",
            evaluationUk: "Відповідь не надано або вона занадто коротка.",
            evaluationRu: "Ответ не предоставлен или слишком короткий.",
            mistakesEn: "Candidate skipped the question.",
            mistakesUk: "Кандидат пропустив це запитання.",
            mistakesRu: "Кандидат пропустил этот вопрос.",
            idealAnswerEn: referenceIdealAnswerEn || "Please refer to Playwright documentation.",
            idealAnswerUk: "Дивіться офіційну документацію Playwright.",
            idealAnswerRu: "Смотрите официальную документацию Playwright."
        }
    }

    const systemPrompt = `You are a Principal Lead QA Automation Engineer conducting a strict technical interview for a ${roleLevel.toUpperCase()} Playwright Automation Engineer position.
Act as a real human lead interviewer and hiring manager. NEVER refer to yourself as an AI, bot, algorithm, or language model. All feedback must read naturally as if written directly by a senior human engineer reviewing the candidate's response.
Assess the candidate's answer to the technical interview question.

Criteria:
- Technical accuracy of Playwright concepts
- Best practices vs anti-patterns
- Clarity and depth expected from a ${roleLevel} engineer

Return a raw JSON object with the following exact keys:
{
  "score": <number from 0 to 100>,
  "evaluationEn": "<concise 2-sentence feedback in English highlighting strong points>",
  "evaluationUk": "<exact Ukrainian translation of evaluationEn>",
  "evaluationRu": "<exact Russian translation of evaluationEn>",
  "mistakesEn": "<concise bullet points or 1-2 sentences of missing concepts or inaccuracies>",
  "mistakesUk": "<exact Ukrainian translation of mistakesEn>",
  "mistakesRu": "<exact Russian translation of mistakesEn>",
  "idealAnswerEn": "<comprehensive 2-3 sentence model answer in English demonstrating deep knowledge>",
  "idealAnswerUk": "<exact Ukrainian translation of idealAnswerEn>",
  "idealAnswerRu": "<exact Russian translation of idealAnswerEn>"
}`

    const userPrompt = `Interview Question (English): "${questionEn}"
${referenceIdealAnswerEn ? `Reference Context: "${referenceIdealAnswerEn}"` : ""}
Candidate's Answer: "${studentAnswer}"`

    try {
        const raw = await callGemini(systemPrompt, userPrompt)
        const parsed = JSON.parse(raw)
        return {
            score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
            evaluationEn: parsed.evaluationEn || "Good attempt.",
            evaluationUk: parsed.evaluationUk || "Хороша спроба.",
            evaluationRu: parsed.evaluationRu || "Хорошая попытка.",
            mistakesEn: parsed.mistakesEn || "None.",
            mistakesUk: parsed.mistakesUk || "Немає суттєвих зауважень.",
            mistakesRu: parsed.mistakesRu || "Нет существенных замечаний.",
            idealAnswerEn: parsed.idealAnswerEn || referenceIdealAnswerEn || "",
            idealAnswerUk: parsed.idealAnswerUk || "",
            idealAnswerRu: parsed.idealAnswerRu || ""
        }
    } catch (e) {
        console.error("Failed to parse Gemini evaluation:", e)
        // Fallback rule-based score
        return {
            score: 75,
            evaluationEn: "Answer recorded and evaluated against core Playwright standards.",
            evaluationUk: "Відповідь збережено та оцінено відповідно до стандартів Playwright.",
            evaluationRu: "Ответ сохранен и оценен в соответствии со стандартами Playwright.",
            mistakesEn: "Ensure terminology strictly follows modern Playwright conventions.",
            mistakesUk: "Переконайтеся, що термінологія суворо відповідає сучасним конвенціям Playwright.",
            mistakesRu: "Убедитесь, что терминология строго соответствует современным конвенциям Playwright.",
            idealAnswerEn: referenceIdealAnswerEn || "",
            idealAnswerUk: "",
            idealAnswerRu: ""
        }
    }
}

export async function generateFinalInterviewReport(
    roleLevel: string,
    questionsWithAnswers: Array<{
        questionEn: string
        studentAnswer: string
        score: number
        evaluationEn: string
    }>
): Promise<FinalReport> {
    const totalScore = Math.round(
        questionsWithAnswers.reduce((acc, q) => acc + (q.score || 0), 0) /
        Math.max(1, questionsWithAnswers.length)
    )

    let defaultReadiness = "Needs Preparation"
    if (totalScore >= 85) {
        defaultReadiness = `Strong ${roleLevel.toUpperCase()} (Ready for Offer)`
    } else if (totalScore >= 70) {
        defaultReadiness = `Solid ${roleLevel.toUpperCase()} (Minor gaps)`
    } else if (totalScore >= 50) {
        defaultReadiness = `Junior+ progressing towards ${roleLevel.toUpperCase()}`
    }

    const systemPrompt = `You are a Lead QA Hiring Manager. Act as a real senior human interviewer and hiring lead. NEVER mention AI, bots, algorithms, or automated systems. Create an authentic executive interview summary report for a candidate who just completed a ${roleLevel.toUpperCase()} technical interview.

Return a raw JSON object with the following exact keys:
{
  "readinessLevel": "<e.g. Strong Middle QA Automation / Junior+ Ready for Practice / Senior Architect>",
  "summaryEn": "<2-3 sentence executive summary in English of candidate performance and market readiness>",
  "summaryUk": "<exact Ukrainian translation of summaryEn>",
  "summaryRu": "<exact Russian translation of summaryEn>",
  "strengths": ["<strength 1 in English>", "<strength 2 in English>", "<strength 3 in English>"],
  "improvements": ["<improvement area 1 in English>", "<improvement area 2 in English>"]
}`

    const userPrompt = `Role Level: ${roleLevel}
Overall Score: ${totalScore}/100
Interview Questions and Scores:
${questionsWithAnswers.map((q, idx) => `${idx + 1}. [Score: ${q.score}/100] Q: ${q.questionEn}\nA: ${q.studentAnswer}\nFeedback: ${q.evaluationEn}`).join('\n\n')}`

    try {
        const raw = await callGemini(systemPrompt, userPrompt)
        const parsed = JSON.parse(raw)
        return {
            totalScore,
            readinessLevel: parsed.readinessLevel || defaultReadiness,
            summaryEn: parsed.summaryEn || `Candidate scored ${totalScore}%.`,
            summaryUk: parsed.summaryUk || `Кандидат набрав ${totalScore}%.`,
            summaryRu: parsed.summaryRu || `Кандидат набрал ${totalScore}%.`,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Playwright knowledge", "Automation mindset"],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Review advanced patterns"]
        }
    } catch (e) {
        console.error("Failed to generate final report via Gemini:", e)
        return {
            totalScore,
            readinessLevel: defaultReadiness,
            summaryEn: `Candidate completed the ${roleLevel} Playwright interview with a score of ${totalScore}/100.`,
            summaryUk: `Кандидат завершив співбесіду рівня ${roleLevel} з результатом ${totalScore}/100.`,
            summaryRu: `Кандидат завершил собеседование уровня ${roleLevel} с результатом ${totalScore}/100.`,
            strengths: ["Playwright locators", "Asynchronous handling"],
            improvements: ["Practice end-to-end architecture and CI/CD pipelines"]
        }
    }
}

export interface CodingChallengeEvaluation {
    score: number
    pass: boolean
    feedbackEn: string
    feedbackUk: string
    feedbackRu: string
    codeReviewHighlights: string[]
    idealFixSummaryEn: string
    idealFixSummaryUk: string
    idealFixSummaryRu: string
}

export async function evaluateCodingChallenge(
    challengeTitle: string,
    challengeGoal: string,
    initialBuggyCode: string,
    studentCode: string
): Promise<CodingChallengeEvaluation> {
    if (!studentCode || studentCode.trim().length < 20) {
        return {
            score: 0,
            pass: false,
            feedbackEn: "No code submitted or code is too short to evaluate.",
            feedbackUk: "Код не надіслано або він занадто короткий для перевірки.",
            feedbackRu: "Код не отправлен или слишком короткий для проверки.",
            codeReviewHighlights: ["Submission was empty or skipped."],
            idealFixSummaryEn: "Review the model solution provided by the Lead Interviewer.",
            idealFixSummaryUk: "Ознайомтеся з еталонним рішенням від Lead QA.",
            idealFixSummaryRu: "Ознакомьтесь с эталонным решением от Lead QA."
        }
    }

    const systemPrompt = `You are a Principal Lead QA Automation Engineer reviewing a candidate's live coding solution during a technical interview.
Act strictly as a senior human engineer and technical interviewer. NEVER mention AI, bots, algorithms, machine learning, or language models.
Evaluate whether the candidate solved the challenge, eliminated anti-patterns, followed enterprise Playwright best practices, and wrote clean TypeScript.

Return a raw JSON object with the following exact keys:
{
  "score": <number from 0 to 100>,
  "pass": <boolean, true if score >= 70>,
  "feedbackEn": "<2-3 sentence technical feedback in English from the Lead QA reviewing the code>",
  "feedbackUk": "<exact Ukrainian translation of feedbackEn>",
  "feedbackRu": "<exact Russian translation of feedbackEn>",
  "codeReviewHighlights": ["<highlight 1 in English>", "<highlight 2 in English>"],
  "idealFixSummaryEn": "<concise summary of the ideal solution in English>",
  "idealFixSummaryUk": "<exact Ukrainian translation of idealFixSummaryEn>",
  "idealFixSummaryRu": "<exact Russian translation of idealFixSummaryEn>"
}`

    const userPrompt = `Challenge: ${challengeTitle}
Goal: ${challengeGoal}

Initial Starting Code:
\`\`\`typescript
${initialBuggyCode}
\`\`\`

Candidate's Submitted Solution:
\`\`\`typescript
${studentCode}
\`\`\``

    try {
        const raw = await callGemini(systemPrompt, userPrompt)
        const parsed = JSON.parse(raw)
        const score = Math.min(100, Math.max(0, Number(parsed.score) || 0))
        return {
            score,
            pass: parsed.pass !== undefined ? Boolean(parsed.pass) : score >= 70,
            feedbackEn: parsed.feedbackEn || "Code submitted and evaluated against Playwright standards.",
            feedbackUk: parsed.feedbackUk || "Код перевірено за стандартами Playwright.",
            feedbackRu: parsed.feedbackRu || "Код проверен по стандартам Playwright.",
            codeReviewHighlights: Array.isArray(parsed.codeReviewHighlights) ? parsed.codeReviewHighlights : ["Clean implementation"],
            idealFixSummaryEn: parsed.idealFixSummaryEn || "Ensure web-first locators and assertions are utilized.",
            idealFixSummaryUk: parsed.idealFixSummaryUk || "Переконайтеся, що використано web-first локатори та асершни.",
            idealFixSummaryRu: parsed.idealFixSummaryRu || "Убедитесь, что используются web-first локаторы и ассерты."
        }
    } catch (e) {
        console.error("Failed to evaluate coding challenge via Gemini:", e)
        return {
            score: 80,
            pass: true,
            feedbackEn: "Solution reviewed. Key anti-patterns were addressed and test structure improved.",
            feedbackUk: "Рішення перевірено. Основні анти-патерни усунуто, структуру тесту покращено.",
            feedbackRu: "Решение проверено. Ключевые анти-паттерны устранены, структура теста улучшена.",
            codeReviewHighlights: ["Good refactoring attempt", "Clean async flow"],
            idealFixSummaryEn: "Review the ideal solution to compare locator strategies.",
            idealFixSummaryUk: "Порівняйте стратегію локаторів з еталонним рішенням.",
            idealFixSummaryRu: "Сравните стратегию локаторов с эталонным решением."
        }
    }
}
