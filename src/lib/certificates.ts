import { db } from "@/db"
import { certificates, tracks, tasks, taskSubmissions, results, users } from "@/db/schema"
import { eq, and, lte } from "drizzle-orm"

export interface CertificateTierDef {
    id: "associate" | "specialist" | "architect"
    title: string
    titleUk: string
    titleRu: string
    levelRange: string
    levelRangeUk: string
    levelRangeEn: string
    levelRangeRu: string
    targetOrder: number // track.order <= targetOrder
    badge: string
    badgeUk: string
    badgeRu: string
    color: string
    accentClass: string
    prefix: string
    description: string
    descriptionUk: string
    descriptionRu: string
    skills: string[]
}

export const CERTIFICATE_TIERS: CertificateTierDef[] = [
    {
        id: "associate",
        title: "Playwright Certified Associate",
        titleUk: "Playwright Certified Associate (Junior)",
        titleRu: "Playwright Certified Associate (Junior)",
        levelRange: "Рівні 0 — 3",
        levelRangeUk: "Рівні 0 — 3",
        levelRangeEn: "Levels 0 — 3",
        levelRangeRu: "Уровни 0 — 3",
        targetOrder: 3,
        badge: "Junior Automation QA",
        badgeUk: "Junior Automation QA",
        badgeRu: "Junior Automation QA",
        color: "blue",
        accentClass: "from-blue-600 to-cyan-500",
        prefix: "A",
        description: "Certified foundational competence in TypeScript for testing, DOM locators, test structure, and automated browser interactions.",
        descriptionUk: "Підтверджує володіння основами TypeScript для тестування, сучасними Playwright-локаторами, структурою тестів та діями в браузері.",
        descriptionRu: "Подтверждает владение основами TypeScript для тестирования, современными Playwright-локаторами, структурой тестов и действиями в браузере.",
        skills: [
            "TypeScript for QA",
            "Playwright Locators & Selectors",
            "Test Structure & Hooks",
            "Web Assertions & Expectations",
            "Form Interactions & Actions",
            "Debugging & Trace Viewer"
        ]
    },
    {
        id: "specialist",
        title: "Playwright Automation Specialist",
        titleUk: "Playwright Automation Specialist (Middle)",
        titleRu: "Playwright Automation Specialist (Middle)",
        levelRange: "Рівні 4 — 7",
        levelRangeUk: "Рівні 4 — 7",
        levelRangeEn: "Levels 4 — 7",
        levelRangeRu: "Уровни 4 — 7",
        targetOrder: 7,
        badge: "Middle QA Engineer",
        badgeUk: "Middle QA Engineer",
        badgeRu: "Middle QA Engineer",
        color: "purple",
        accentClass: "from-purple-600 to-indigo-500",
        prefix: "S",
        description: "Certified proficiency in scalable test automation frameworks, Page Object Model, API testing, and stateful session management.",
        descriptionUk: "Підтверджує навички побудови надійних автотестів, Page Object Model, API-тестування, фікстур та збереження сесій авторизації.",
        descriptionRu: "Подтверждает навыки построения надежных автотестов, Page Object Model, API-тестирования, фикстур и сохранения сессий авторизации.",
        skills: [
            "Page Object Model (POM)",
            "API Testing & Request Context",
            "Authentication & Session Storage",
            "Custom Test Fixtures",
            "Dynamic Elements & Network Interception",
            "Visual Regression Testing"
        ]
    },
    {
        id: "architect",
        title: "Playwright Lead Architect",
        titleUk: "Playwright Lead Architect (Senior)",
        titleRu: "Playwright Lead Architect (Senior)",
        levelRange: "Рівні 8 — 10",
        levelRangeUk: "Рівні 8 — 10",
        levelRangeEn: "Levels 8 — 10",
        levelRangeRu: "Уровни 8 — 10",
        targetOrder: 10,
        badge: "Senior QA Architect",
        badgeUk: "Senior QA Architect",
        badgeRu: "Senior QA Architect",
        color: "amber",
        accentClass: "from-amber-500 to-orange-500",
        prefix: "L",
        description: "Certified mastery in end-to-end test framework architecture, parallel execution, CI/CD pipeline integration, and cross-browser resilience.",
        descriptionUk: "Найвищий кваліфікаційний ступінь: проєктування архітектури фреймворку з нуля, паралельний запуск, CI/CD пайплайни та фінальний проєкт.",
        descriptionRu: "Высшая квалификационная ступень: проектирование архитектуры фреймворка с нуля, параллельный запуск, CI/CD пайплайны и финальный проект.",
        skills: [
            "Enterprise Framework Architecture",
            "Parallel Execution & Sharding",
            "CI/CD Integration (GitHub Actions)",
            "Docker & Cross-Browser Grid",
            "Custom Reporters & HTML Dashboards",
            "Production Test Automation Suite"
        ]
    }
]

export interface UserCertificateProgress {
    tier: CertificateTierDef
    totalTasks: number
    completedTasks: number
    percentage: number
    isUnlocked: boolean
    certificate: typeof certificates.$inferSelect | null
}

export async function getUserCertificates(userId: string): Promise<UserCertificateProgress[]> {
    // 1. Get user info
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    const studentName = user?.name || user?.firstName || "Student"

    // 2. Get all active tracks and tasks
    const allTracks = await db.select().from(tracks).where(eq(tracks.isActive, true))
    const allTasks = await db.select().from(tasks).where(eq(tasks.isActive, true))

    // 3. User's approved tasks (reviewed submissions + passed quizzes)
    const userSubs = await db.select().from(taskSubmissions).where(
        and(eq(taskSubmissions.userId, userId), eq(taskSubmissions.status, "reviewed"))
    )
    const quizResults = await db.select().from(results).where(
        and(eq(results.userId, userId), eq(results.status, "passed"))
    )

    const approvedTaskIds = new Set([
        ...userSubs.map(s => s.taskId).filter(Boolean),
        ...quizResults.map(r => r.taskId).filter(Boolean)
    ])

    // Calculate total lines of code
    let totalLinesOfCode = 0
    const taskCodeMap = new Map<number, string>()
    for (const sub of userSubs) {
        if (sub.taskId && sub.code && !taskCodeMap.has(sub.taskId)) {
            taskCodeMap.set(sub.taskId, sub.code)
            const lines = sub.code.split('\n').filter(l => l.trim().length > 0).length
            totalLinesOfCode += lines
        }
    }

    // 4. Existing certificates of this user
    const existingCerts = await db.select().from(certificates).where(eq(certificates.userId, userId))
    const certByTier = new Map(existingCerts.map(c => [c.tier, c]))

    // 5. Evaluate each tier
    const resultsList: UserCertificateProgress[] = []

    for (const tierDef of CERTIFICATE_TIERS) {
        const tierTracks = allTracks.filter(tr => (tr.order ?? 0) <= tierDef.targetOrder)
        const tierTrackIds = new Set(tierTracks.map(t => t.id))
        const tierTasks = allTasks.filter(t => t.trackId && tierTrackIds.has(t.trackId))

        const totalTasks = tierTasks.length
        const completedTasks = tierTasks.filter(t => approvedTaskIds.has(t.id)).length
        const percentage = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0
        const isEligible = totalTasks > 0 && completedTasks >= totalTasks

        let cert = certByTier.get(tierDef.id) || null

        // If eligible but not yet created, auto-issue certificate!
        if (isEligible && !cert) {
            const year = new Date().getFullYear()
            const randomCode = Math.floor(1000 + Math.random() * 9000)
            const certNum = `PW-${year}-${tierDef.prefix}${randomCode}`

            try {
                await db.insert(certificates).values({
                    certificateNumber: certNum,
                    userId,
                    tier: tierDef.id,
                    studentName,
                    skills: tierDef.skills,
                    tasksCompleted: completedTasks,
                    linesOfCode: totalLinesOfCode,
                })

                const [newCert] = await db.select().from(certificates).where(eq(certificates.certificateNumber, certNum))
                cert = newCert || null
            } catch (e: any) {
                console.error("Failed to auto-issue certificate:", e.message)
            }
        }

        resultsList.push({
            tier: tierDef,
            totalTasks,
            completedTasks,
            percentage,
            isUnlocked: Boolean(cert),
            certificate: cert,
        })
    }

    return resultsList
}

export function getTierTitle(tier: CertificateTierDef, locale: string): string {
    if (locale === 'en') return tier.title
    if (locale === 'ru') return tier.titleRu
    return tier.titleUk
}

export function getTierBadge(tier: CertificateTierDef, locale: string): string {
    if (locale === 'en') return tier.badge
    if (locale === 'ru') return tier.badgeRu
    return tier.badgeUk
}

export function getTierDescription(tier: CertificateTierDef, locale: string): string {
    if (locale === 'en') return tier.description
    if (locale === 'ru') return tier.descriptionRu
    return tier.descriptionUk
}

export function getTierLevelRange(tier: CertificateTierDef, locale: string): string {
    if (locale === 'en') return tier.levelRangeEn || tier.levelRange
    if (locale === 'ru') return tier.levelRangeRu || tier.levelRange
    return tier.levelRangeUk || tier.levelRange
}
