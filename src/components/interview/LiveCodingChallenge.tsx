"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    Code2, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle,
    Clock, Send, Sparkles, Eye, EyeOff, Copy, Check, ChevronRight,
    Terminal, Layers, ShieldCheck, GripVertical, ChevronDown, ChevronUp,
    CheckCheck, XCircle, RefreshCw, Cpu, MessageSquare, GraduationCap, X
} from "lucide-react"
import { CODING_CHALLENGES, CodingChallenge } from "@/lib/codingChallengesBank"
import CodeEditor from "@/components/editor/Monaco"
import { toast } from "sonner"

interface Props {
    locale: string
    hasInterviewAccess?: boolean
}

interface TerminalLog {
    text: string
    type: 'cmd' | 'info' | 'success' | 'warn' | 'error'
    timestamp?: string
}

interface InterviewerQA {
    question: string
    answerEn: string
    answerUk: string
    answerRu: string
    timestamp: string
}

export default function LiveCodingChallenge({ locale, hasInterviewAccess = true }: Props) {
    const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CODING_CHALLENGES[0].id)
    const currentChallenge = CODING_CHALLENGES.find(c => c.id === selectedChallengeId) || CODING_CHALLENGES[0]

    // Code state
    const [code, setCode] = useState<string>(currentChallenge.starterCode)
    const [taskLang, setTaskLang] = useState<'en' | 'uk' | 'ru'>('en')

    // Timer state
    const [secondsLeft, setSecondsLeft] = useState<number>(currentChallenge.timeLimitMinutes * 60)
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)

    // Review & Terminal state
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isRunningTests, setIsRunningTests] = useState<boolean>(false)
    const [evaluation, setEvaluation] = useState<any | null>(null)
    const [showSolution, setShowSolution] = useState<boolean>(false)
    const [showHints, setShowHints] = useState<boolean>(false)
    const [copiedSolution, setCopiedSolution] = useState<boolean>(false)

    // Interviewer Clarification Q&A state
    const [qaList, setQaList] = useState<InterviewerQA[]>([])
    const [candidateQuestion, setCandidateQuestion] = useState<string>("")
    const [isAskingInterviewer, setIsAskingInterviewer] = useState<boolean>(false)

    // Send to Platform Mentor state
    const [showMentorModal, setShowMentorModal] = useState<boolean>(false)
    const [mentorNotes, setMentorNotes] = useState<string>("")
    const [isSendingToMentor, setIsSendingToMentor] = useState<boolean>(false)
    const [hasSentToMentor, setHasSentToMentor] = useState<boolean>(false)

    // Terminal Drawer state
    const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true)
    const [terminalTab, setTerminalTab] = useState<'console' | 'review'>('console')
    const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
        { text: "$ npx playwright test --project=chromium", type: "cmd" },
        { text: "Playwright test runner initialized. TypeScript environment ready.", type: "info" },
        { text: `Loaded challenge: ${currentChallenge.titleEn}`, type: "info" }
    ])

    // Resizable Split View state (Desktop width percentage for left panel)
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(38)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [isDesktop, setIsDesktop] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Reset code, timer, logs and Q&A when changing challenge
    useEffect(() => {
        setCode(currentChallenge.starterCode)
        setSecondsLeft(currentChallenge.timeLimitMinutes * 60)
        setIsTimerRunning(false)
        setEvaluation(null)
        setShowSolution(false)
        setShowHints(false)
        setQaList([])
        setCandidateQuestion("")
        setHasSentToMentor(false)
        setTerminalTab('console')
        setTerminalLogs([
            { text: "$ npx playwright test --project=chromium", type: "cmd" },
            { text: `Loaded challenge: ${currentChallenge.titleEn} (${currentChallenge.level.toUpperCase()})`, type: "info" },
            { text: "Write your solution and click 'Run Test' or 'Submit for Lead Review'.", type: "info" }
        ])
    }, [selectedChallengeId])

    // Timer countdown effect
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null
        if (isTimerRunning && secondsLeft > 0) {
            timer = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false)
                        toast.info(locale === 'en' ? "Time is up! Submit your solution for review." : "Час вичерпано! Надішліть код на перевірку.")
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isTimerRunning, secondsLeft, locale])

    // Resizable Splitter mouse events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return
            const containerRect = containerRef.current.getBoundingClientRect()
            const newPercentage = ((e.clientX - containerRect.left) / containerRect.width) * 100
            if (newPercentage >= 25 && newPercentage <= 60) {
                setLeftPanelWidth(newPercentage)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        } else {
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isDragging])

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const resetCode = () => {
        const confirmMsg = locale === 'en'
            ? "Reset your code back to the initial starter code?"
            : (locale === 'ru' ? "Сбросить код к начальному шаблону?" : "Скинути код до початкового стану?")
        if (window.confirm(confirmMsg)) {
            setCode(currentChallenge.starterCode)
            setEvaluation(null)
            setTerminalLogs(prev => [
                ...prev,
                { text: "$ git checkout -- test.spec.ts", type: "cmd" },
                { text: "Code reverted to starting state.", type: "warn" }
            ])
            toast.success(locale === 'en' ? "Code reset" : "Код скинуто")
        }
    }

    const copySolution = () => {
        navigator.clipboard.writeText(currentChallenge.solutionCode)
        setCopiedSolution(true)
        setTimeout(() => setCopiedSolution(false), 2000)
        toast.success(locale === 'en' ? "Model solution copied!" : "Еталонне рішення скопійовано!")
    }

    // Ask Interviewer Action
    const askInterviewerAction = async () => {
        if (!candidateQuestion || candidateQuestion.trim().length < 3) {
            toast.error(locale === 'en' ? "Please type a question for the interviewer." : "Будь ласка, введіть запитання до інтерв'ювера.")
            return
        }

        setIsAskingInterviewer(true)
        try {
            const res = await fetch("/api/interview/ask-interviewer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    challengeTitle: currentChallenge.titleEn,
                    challengeGoal: currentChallenge.goalEn,
                    candidateQuestion: candidateQuestion.trim()
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to get answer")

            const newQA: InterviewerQA = {
                question: candidateQuestion.trim(),
                answerEn: data.response.answerEn,
                answerUk: data.response.answerUk,
                answerRu: data.response.answerRu,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            setQaList(prev => [...prev, newQA])
            setCandidateQuestion("")
            toast.success(locale === 'en' ? "Lead Interviewer answered!" : "Інтерв'ювер відповів на запитання!")
        } catch (e: any) {
            toast.error(e.message || "Failed to contact interviewer")
        } finally {
            setIsAskingInterviewer(false)
        }
    }

    // Send Solution to Platform Mentor
    const sendSolutionToMentor = async () => {
        setIsSendingToMentor(true)
        try {
            const res = await fetch("/api/interview/send-to-mentor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "coding_challenge",
                    title: `${currentChallenge.titleEn} (${currentChallenge.level.toUpperCase()})`,
                    roleLevel: currentChallenge.level,
                    score: evaluation?.score || 0,
                    details: code,
                    candidateNotes: mentorNotes.trim()
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit to mentor")

            setHasSentToMentor(true)
            setShowMentorModal(false)
            toast.success(locale === 'en' ? "Solution sent to platform mentor!" : "Рішення надіслано ментору платформи!")
        } catch (e: any) {
            toast.error(e.message || "Failed to send to mentor")
        } finally {
            setIsSendingToMentor(false)
        }
    }

    // Local Test Simulation Runner
    const runPlaywrightTest = async () => {
        if (!code || code.trim().length < 15) {
            toast.error(locale === 'en' ? "Please write some code first." : "Будь ласка, напишіть код перед запуском.")
            return
        }

        setIsRunningTests(true)
        setIsTerminalOpen(true)
        setTerminalTab('console')

        const logs: TerminalLog[] = [
            { text: `$ npx playwright test tests/challenge.spec.ts --reporter=list`, type: "cmd" },
            { text: `Running 1 test using 1 worker (Chromium Headless)...`, type: "info" }
        ]
        setTerminalLogs(logs)

        await new Promise(r => setTimeout(r, 600))

        const hasWaitForTimeout = /waitForTimeout\s*\(/.test(code)
        const hasBrittleXpath = /xpath=|\/\/[a-zA-Z]/.test(code)
        const hasImperativeInnerText = /expect\s*\(\s*await.*\.innerText\s*\(\s*\)\s*\)\.toBe/.test(code)

        if (hasWaitForTimeout) {
            setTerminalLogs(prev => [
                ...prev,
                { text: `  ✘ 1 [chromium] › tests/challenge.spec.ts:12:5 › ${currentChallenge.titleEn} (1.9s)`, type: "error" },
                { text: `Error: Anti-pattern 'page.waitForTimeout()' detected.`, type: "error" },
                { text: `Enterprise QA Standard: Hardcoded sleeps are forbidden in CI pipelines. Use web-first auto-retrying assertions instead.`, type: "warn" },
                { text: `1 failed (1.9s)`, type: "error" }
            ])
            toast.error(locale === 'en' ? "Test failed: remove waitForTimeout!" : "Тест не пройшов: видаліть waitForTimeout!")
        } else if (hasBrittleXpath && currentChallenge.id === 'challenge-flaky-checkout') {
            setTerminalLogs(prev => [
                ...prev,
                { text: `  ✘ 1 [chromium] › tests/challenge.spec.ts:15:5 › ${currentChallenge.titleEn} (2.1s)`, type: "error" },
                { text: `Warning: Brittle XPath locator detected. Replace with getByRole() or getByTestId().`, type: "warn" },
                { text: `1 test completed with architectural warnings.`, type: "warn" }
            ])
            toast.warning(locale === 'en' ? "Brittle locators detected. Use role-based locators." : "Виявлено крихкий XPath. Використайте getByRole().")
        } else if (hasImperativeInnerText && currentChallenge.id === 'challenge-flaky-checkout') {
            setTerminalLogs(prev => [
                ...prev,
                { text: `  ✘ 1 [chromium] › tests/challenge.spec.ts:18:5 › ${currentChallenge.titleEn} (2.4s)`, type: "error" },
                { text: `Error: Race condition detected. 'expect(await loc.innerText()).toBe()' does not auto-retry.`, type: "error" },
                { text: `Replace with web-first 'await expect(loc).toHaveText(...)'.`, type: "info" }
            ])
            toast.error(locale === 'en' ? "Race condition: use await expect(locator).toHaveText()" : "Race condition: використайте await expect(locator).toHaveText()")
        } else {
            setTerminalLogs(prev => [
                ...prev,
                { text: `  ✓ 1 [chromium] › tests/challenge.spec.ts:5:5 › ${currentChallenge.titleEn} (1.4s)`, type: "success" },
                { text: `✓ Clean test execution: All assertions resolved within auto-waiting timeout.`, type: "success" },
                { text: `Ready for Lead QA review. Click 'Submit for Lead Review' to receive full enterprise evaluation.`, type: "info" },
                { text: `1 passed (1.4s)`, type: "success" }
            ])
            toast.success(locale === 'en' ? "Test passed cleanly! Ready for Lead review." : "Тест пройшов успішно! Готовий до перевірки лідом.")
        }

        setIsRunningTests(false)
    }

    // Lead QA Review Submission
    const submitForReview = async () => {
        if (!hasInterviewAccess) {
            toast.error(locale === 'en' ? "Code Audit is available in PRO and Team plans. Please upgrade." : "AI-аудит коду доступний у тарифах PRO та B2B. Будь ласка, оновіть тариф.")
            setIsTerminalOpen(true)
            setTerminalLogs(prev => [
                ...prev,
                { text: "✘ 403 Forbidden: Upgrade to PRO or B2B to run AI Code Review.", type: "error" }
            ])
            return
        }

        if (!code || code.trim().length < 20) {
            toast.error(locale === 'en' ? "Please write a solution before submitting." : "Будь ласка, напишіть рішення перед відправкою.")
            return
        }

        setIsSubmitting(true)
        setIsTerminalOpen(true)
        setTerminalTab('console')

        setTerminalLogs(prev => [
            ...prev,
            { text: "$ git push origin review/candidate-submission", type: "cmd" },
            { text: "Triggering Principal Lead QA code audit pipeline...", type: "info" }
        ])

        try {
            const res = await fetch("/api/interview/coding-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    challengeTitle: currentChallenge.titleEn,
                    challengeGoal: currentChallenge.goalEn,
                    initialBuggyCode: currentChallenge.starterCode,
                    studentCode: code
                })
            })

            if (res.status === 403) {
                toast.error(locale === 'en' ? "Access denied: Upgrade to PRO or B2B." : "Доступ обмежено: оновіть тариф до PRO або B2B.")
                setTerminalLogs(prev => [
                    ...prev,
                    { text: "✘ 403 Forbidden: Your current role lacks interview access.", type: "error" }
                ])
                return
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Review failed")

            setEvaluation(data.evaluation)
            setIsTimerRunning(false)

            setTerminalLogs(prev => [
                ...prev,
                {
                    text: data.evaluation.pass
                        ? `✓ Lead QA Audit PASSED: Score ${data.evaluation.score}/100`
                        : `✘ Lead QA Audit REVISION REQUIRED: Score ${data.evaluation.score}/100`,
                    type: data.evaluation.pass ? "success" : "error"
                },
                { text: "Audit report ready. Switching to Lead Review tab...", type: "info" }
            ])

            setTerminalTab('review')

            if (data.evaluation.pass) {
                toast.success(locale === 'en' ? "Lead Review: Passed! Excellent solution." : "Рев'ю ліда: Зараховано! Відмінне рішення.")
            } else {
                toast.warning(locale === 'en' ? "Lead Review: Needs improvement. Check feedback." : "Рев'ю ліда: Потрібні доопрацювання. Перевірте фідбек.")
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to submit code for review")
            setTerminalLogs(prev => [
                ...prev,
                { text: `Error: ${e.message || "Pipeline failed"}`, type: "error" }
            ])
        } finally {
            setIsSubmitting(false)
        }
    }

    const getLocalizedTitle = () => {
        if (taskLang === 'uk') return currentChallenge.titleUk
        if (taskLang === 'ru') return currentChallenge.titleRu
        return currentChallenge.titleEn
    }

    const getLocalizedGoal = () => {
        if (taskLang === 'uk') return currentChallenge.goalUk
        if (taskLang === 'ru') return currentChallenge.goalRu
        return currentChallenge.goalEn
    }

    const getLocalizedInstructions = () => {
        if (taskLang === 'uk') return currentChallenge.instructionsUk
        if (taskLang === 'ru') return currentChallenge.instructionsRu
        return currentChallenge.instructionsEn
    }

    const getLocalizedHints = () => {
        if (taskLang === 'uk') return currentChallenge.hintsUk
        if (taskLang === 'ru') return currentChallenge.hintsRu
        return currentChallenge.hintsEn
    }

    const getLocalizedFeedback = (ev: any) => {
        if (locale === 'uk') return ev.feedbackUk || ev.feedbackEn
        if (locale === 'ru') return ev.feedbackRu || ev.feedbackEn
        return ev.feedbackEn
    }

    return (
        <div className="space-y-6">
            {/* Top Selector Bar: 3 Challenges */}
            <div className="p-4 sm:p-5 rounded-2xl glass-card-premium border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-purple-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white">
                                {locale === 'en' ? "Live Technical Coding Round" : (locale === 'ru' ? "Технический лайв-кодинг раунд" : "Технічний лайв-кодинг раунд")}
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                {locale === 'en' ? "Simulate timed enterprise coding challenges asked during technical interviews." : "Симуляція практичних завдань на час під час реальної співбесіди."}
                            </p>
                        </div>
                    </div>

                    {/* Timer Widget */}
                    <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                        <Clock className={`w-4 h-4 ${secondsLeft < 180 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                        <span className={`font-mono text-sm font-bold ${secondsLeft < 180 ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(secondsLeft)}
                        </span>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button
                            type="button"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                            title={isTimerRunning ? "Pause timer" : "Start timer"}
                        >
                            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsTimerRunning(false)
                                setSecondsLeft(currentChallenge.timeLimitMinutes * 60)
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                            title="Reset timer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Challenge Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    {CODING_CHALLENGES.map((ch, idx) => {
                        const isSelected = ch.id === selectedChallengeId
                        return (
                            <button
                                key={ch.id}
                                type="button"
                                onClick={() => setSelectedChallengeId(ch.id)}
                                className={`p-3 rounded-xl text-left border transition-all ${
                                    isSelected
                                        ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                                        Task #{idx + 1} • {ch.level}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {ch.timeLimitMinutes} min
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-white truncate">
                                    {locale === 'en' ? ch.titleEn : (locale === 'ru' ? ch.titleRu : ch.titleUk)}
                                </h4>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Resizable Workspace Container */}
            <div
                ref={containerRef}
                className="flex flex-col lg:flex-row gap-0 items-stretch relative min-h-[720px]"
            >
                {/* Left Column: Requirements, Solution drawers & Interviewer Clarification */}
                <div
                    style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
                    className="w-full flex-shrink-0 space-y-4 pr-0 lg:pr-3"
                >
                    <div className="p-6 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-4">
                        {/* Task Header & Language Switcher */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {currentChallenge.category}
                            </span>
                            <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setTaskLang('en')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        taskLang === 'en' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    EN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTaskLang('uk')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        taskLang === 'uk' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    UA
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTaskLang('ru')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        taskLang === 'ru' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    RU
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                {getLocalizedTitle()}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                {getLocalizedGoal()}
                            </p>
                        </div>

                        {/* Acceptance Criteria */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{locale === 'en' ? "Acceptance Criteria:" : (locale === 'ru' ? "Критерии приемки:" : "Критерії прийомки:")}</span>
                            </h4>
                            <ul className="space-y-1.5">
                                {getLocalizedInstructions().map((inst, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                        <span className="text-purple-400 font-bold">•</span>
                                        <span>{inst}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Clarify with Lead Interviewer Card */}
                        <div className="p-4 rounded-2xl bg-blue-500/[0.03] border border-blue-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-white">
                                        {locale === 'en' ? "Clarify with Lead Interviewer" : "Уточнити у інтерв'ювера"}
                                    </span>
                                </div>
                                <span className="text-[10px] text-blue-400/80 font-medium">
                                    {locale === 'en' ? "Soft Skills practice" : "Практика комунікації"}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                {locale === 'en'
                                    ? "Senior engineers always ask clarifying questions before coding. Ask about constraints, test data, or mocking rules."
                                    : "Senior спеціалісти завжди уточнюють вимоги перед кодингом. Запитайте про обмеження, тестові дані чи моки."}
                            </p>

                            {/* Q&A Dialog History */}
                            {qaList.length > 0 && (
                                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                    {qaList.map((qa, i) => (
                                        <div key={i} className="space-y-1.5 text-xs">
                                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                                                <span className="text-[10px] uppercase font-bold text-purple-400 block mb-0.5">
                                                    {locale === 'en' ? "You asked:" : "Ваше запитання:"}
                                                </span>
                                                {qa.question}
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-200">
                                                <span className="text-[10px] uppercase font-bold text-blue-400 block mb-0.5">
                                                    {locale === 'en' ? "Lead QA answered:" : "Відповідь Lead QA:"}
                                                </span>
                                                {locale === 'uk' ? qa.answerUk : (locale === 'ru' ? qa.answerRu : qa.answerEn)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Question Input Form */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="text"
                                    value={candidateQuestion}
                                    onChange={e => setCandidateQuestion(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') askInterviewerAction()
                                    }}
                                    placeholder={
                                        locale === 'en'
                                            ? "e.g. Can we use testId or role-based locators only?"
                                            : "напр., Чи можемо ми мокувати бекенд через page.route?"
                                    }
                                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    disabled={isAskingInterviewer || !candidateQuestion.trim()}
                                    onClick={askInterviewerAction}
                                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-blue-500/20"
                                >
                                    <Send className="w-3 h-3" />
                                    <span>{isAskingInterviewer ? "..." : (locale === 'en' ? "Ask" : "Запитати")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Hints Drawer */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowHints(!showHints)}
                                className="text-xs text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>{showHints ? (locale === 'en' ? "Hide Lead Hints" : "Приховати підказки") : (locale === 'en' ? "Show Lead Hints" : "Показати підказки ліда")}</span>
                            </button>
                            {showHints && (
                                <ul className="mt-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs text-slate-300">
                                    {getLocalizedHints().map((hint, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-amber-400 font-bold">•</span>
                                            <span>{hint}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Lead Model Solution Drawer */}
                        <div className="pt-2 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setShowSolution(!showSolution)}
                                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
                            >
                                {showSolution ? (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        <span>{locale === 'en' ? "Hide Model Solution" : "Приховати еталонне рішення"}</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>{locale === 'en' ? "View Lead Model Solution" : (locale === 'ru' ? "Посмотреть эталонный код Lead QA" : "Переглянути еталонний код Lead QA")}</span>
                                    </>
                                )}
                            </button>

                            {showSolution && (
                                <div className="mt-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                            {locale === 'en' ? "Lead QA Model Code:" : "Еталонний код Lead QA:"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copySolution}
                                            className="p-1 rounded text-slate-400 hover:text-white"
                                            title="Copy"
                                        >
                                            {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <pre className="text-[11px] font-mono text-slate-200 bg-black/40 p-3 rounded-xl overflow-x-auto max-h-60 leading-relaxed">
                                        {currentChallenge.solutionCode}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resizable Divider Handle (Desktop) */}
                <div
                    onMouseDown={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                    }}
                    onDoubleClick={() => setLeftPanelWidth(38)}
                    className="hidden lg:flex items-center justify-center w-3 cursor-col-resize group relative z-20 select-none hover:bg-purple-500/10 transition-colors rounded-full"
                    title={locale === 'en' ? "Drag to resize panels (Double-click to reset)" : "Потягніть для зміни ширини (Подвійний клік - скидання)"}
                >
                    <div className={`w-1 h-16 rounded-full transition-all ${
                        isDragging ? "bg-purple-400 shadow-lg shadow-purple-500/50 scale-y-125" : "bg-white/10 group-hover:bg-purple-400/70"
                    }`} />
                </div>

                {/* Right Column: Monaco Code Editor + Integrated Terminal */}
                <div
                    className="w-full flex-1 flex flex-col space-y-4 pl-0 lg:pl-3 min-w-0"
                >
                    <div className="p-4 rounded-3xl glass-card-premium border border-white/10 shadow-xl flex-1 flex flex-col">
                        {/* Editor Header Bar */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-xs">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-blue-400" />
                                <span className="font-mono text-slate-300 text-xs font-semibold">
                                    test.spec.ts
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                                    TypeScript • @playwright/test
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={resetCode}
                                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>{locale === 'en' ? "Reset Code" : (locale === 'ru' ? "Сбросить" : "Скинути")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Monaco Editor Container */}
                        <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1e1e1e] min-h-[380px] lg:min-h-[440px]">
                            <CodeEditor
                                value={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>

                        {/* Integrated Terminal Drawer */}
                        <div className="mt-4 rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex flex-col">
                            {/* Terminal Top Tabs Bar */}
                            <div className="flex items-center justify-between bg-white/[0.03] px-3 py-2 border-b border-white/5 text-xs">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTerminalTab('console')
                                            setIsTerminalOpen(true)
                                        }}
                                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
                                            terminalTab === 'console' && isTerminalOpen
                                                ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span>Terminal & Test Runner</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTerminalTab('review')
                                            setIsTerminalOpen(true)
                                        }}
                                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs relative ${
                                            terminalTab === 'review' && isTerminalOpen
                                                ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Lead QA Score & Review</span>
                                        {evaluation && (
                                            <span className={`w-2 h-2 rounded-full ${evaluation.pass ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                    title={isTerminalOpen ? "Collapse terminal" : "Expand terminal"}
                                >
                                    {isTerminalOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Terminal Body */}
                            {isTerminalOpen && (
                                <div className="p-3.5 max-h-56 overflow-y-auto font-mono text-[11px] space-y-1.5">
                                    {terminalTab === 'console' && (
                                        <div className="space-y-1">
                                            {terminalLogs.map((log, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`leading-relaxed break-all ${
                                                        log.type === 'cmd'
                                                            ? "text-blue-400 font-bold"
                                                            : log.type === 'success'
                                                                ? "text-emerald-400 font-bold"
                                                                : log.type === 'error'
                                                                    ? "text-rose-400 font-bold"
                                                                    : log.type === 'warn'
                                                                        ? "text-amber-300"
                                                                        : "text-slate-400"
                                                    }`}
                                                >
                                                    {log.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {terminalTab === 'review' && (
                                        <div>
                                            {!evaluation ? (
                                                <div className="text-slate-500 py-3 text-center font-sans text-xs">
                                                    {locale === 'en'
                                                        ? "No review report yet. Submit your code using 'Submit for Lead Review' below."
                                                        : "Рев'ю ще не проводилося. Натисніть 'Здати на перевірку Lead QA' нижче."}
                                                </div>
                                            ) : (
                                                <div className="font-sans space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {evaluation.pass ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                            ) : (
                                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                            )}
                                                            <span className="text-xs font-bold text-white">
                                                                {evaluation.pass
                                                                    ? (locale === 'en' ? "Lead Review: Passed" : "Перевірка пройдена")
                                                                    : (locale === 'en' ? "Lead Review: Needs Improvement" : "Потрібні доопрацювання")}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                                            evaluation.pass ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                        }`}>
                                                            {evaluation.score}/100
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-200 leading-relaxed">
                                                        {getLocalizedFeedback(evaluation)}
                                                    </p>

                                                    {evaluation.codeReviewHighlights?.length > 0 && (
                                                        <div className="space-y-1 pt-2 border-t border-white/5">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                                {locale === 'en' ? "Lead QA Highlights:" : "Зауваження Lead QA:"}
                                                            </span>
                                                            <ul className="space-y-1">
                                                                {evaluation.codeReviewHighlights.map((h: string, idx: number) => (
                                                                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                                                                        <span className="text-purple-400">•</span>
                                                                        <span>{h}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action CTA Bar */}
                        <div className="pt-4 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                                <span>{locale === 'en' ? "Chromium headless sandbox environment" : "Середовище тестування Chromium Headless"}</span>
                            </span>

                            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    type="button"
                                    disabled={isRunningTests || isSubmitting}
                                    onClick={runPlaywrightTest}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{isRunningTests ? (locale === 'en' ? "Running..." : "Виконання...") : (locale === 'en' ? "Run Test" : "Запустити тест")}</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={isSubmitting || isRunningTests}
                                    onClick={submitForReview}
                                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? (locale === 'en' ? "Reviewing..." : "Перевірка...") : (locale === 'en' ? "Submit for Lead Review" : (locale === 'ru' ? "Сдать на проверку Lead QA" : "Здати на перевірку Lead QA"))}</span>
                                </button>

                                {/* Send to Mentor Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMentorModal(true)}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                                        hasSentToMentor
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                            : "bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30"
                                    }`}
                                >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>{hasSentToMentor ? (locale === 'en' ? "Sent to Mentor ✓" : "Надіслано ментору ✓") : (locale === 'en' ? "Send to Mentor" : "Надіслати ментору")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mentor Submission Modal */}
            {showMentorModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg p-6 rounded-3xl glass-card-premium border border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-base font-bold text-white">
                                    {locale === 'en' ? "Send Solution to Platform Mentor" : "Надіслати розв'язок ментору курсу"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMentorModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {locale === 'en'
                                ? "Your code, test structure, and Lead QA evaluation score will be forwarded directly to your personal mentor for review and personalized feedback."
                                : "Ваш код та результати перевірки будуть надіслані особистому ментору платформи для детального ручного фідбеку."}
                        </p>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs">
                            <span className="text-slate-400 font-semibold block">
                                {locale === 'en' ? "Task:" : "Завдання:"} {currentChallenge.titleEn}
                            </span>
                            <span className="text-purple-400 font-mono font-bold block">
                                {evaluation ? `Score: ${evaluation.score}/100 (${evaluation.pass ? 'PASSED' : 'NEEDS IMPROVEMENT'})` : "Status: Not evaluated yet"}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 block">
                                {locale === 'en' ? "Questions or notes for mentor (optional):" : "Ваш коментар чи запитання до ментора (необов'язково):"}
                            </label>
                            <textarea
                                value={mentorNotes}
                                onChange={e => setMentorNotes(e.target.value)}
                                rows={3}
                                placeholder={locale === 'en' ? "e.g. Please check if my Page Object architecture is clean..." : "напр., Зверніть увагу на структуру фікстур та чи немає зайвих очікувань..."}
                                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none font-sans"
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowMentorModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                            >
                                {locale === 'en' ? "Cancel" : "Скасувати"}
                            </button>
                            <button
                                type="button"
                                disabled={isSendingToMentor}
                                onClick={sendSolutionToMentor}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSendingToMentor ? (locale === 'en' ? "Sending..." : "Надсилання...") : (locale === 'en' ? "Send to Mentor" : "Відправити ментору")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
