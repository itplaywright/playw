"use client"

import React, { useState, useEffect } from "react"
import {
    Code2, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle,
    Clock, Send, Sparkles, Eye, EyeOff, Copy, Check, ChevronRight,
    Terminal, Layers, ShieldCheck
} from "lucide-react"
import { CODING_CHALLENGES, CodingChallenge } from "@/lib/codingChallengesBank"
import CodeEditor from "@/components/editor/Monaco"
import { toast } from "sonner"

interface Props {
    locale: string
}

export default function LiveCodingChallenge({ locale }: Props) {
    const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CODING_CHALLENGES[0].id)
    const currentChallenge = CODING_CHALLENGES.find(c => c.id === selectedChallengeId) || CODING_CHALLENGES[0]

    // Code state
    const [code, setCode] = useState<string>(currentChallenge.starterCode)
    const [taskLang, setTaskLang] = useState<'en' | 'uk' | 'ru'>('en')

    // Timer state
    const [secondsLeft, setSecondsLeft] = useState<number>(currentChallenge.timeLimitMinutes * 60)
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)

    // Review state
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [evaluation, setEvaluation] = useState<any | null>(null)
    const [showSolution, setShowSolution] = useState<boolean>(false)
    const [showHints, setShowHints] = useState<boolean>(false)
    const [copiedSolution, setCopiedSolution] = useState<boolean>(false)

    // Reset code and timer when changing challenge
    useEffect(() => {
        setCode(currentChallenge.starterCode)
        setSecondsLeft(currentChallenge.timeLimitMinutes * 60)
        setIsTimerRunning(false)
        setEvaluation(null)
        setShowSolution(false)
        setShowHints(false)
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
            toast.success(locale === 'en' ? "Code reset" : "Код скинуто")
        }
    }

    const copySolution = () => {
        navigator.clipboard.writeText(currentChallenge.solutionCode)
        setCopiedSolution(true)
        setTimeout(() => setCopiedSolution(false), 2000)
        toast.success(locale === 'en' ? "Model solution copied!" : "Еталонне рішення скопійовано!")
    }

    const submitForReview = async () => {
        if (!code || code.trim().length < 20) {
            toast.error(locale === 'en' ? "Please write a solution before submitting." : "Будь ласка, напишіть рішення перед відправкою.")
            return
        }

        setIsSubmitting(true)
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

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Review failed")

            setEvaluation(data.evaluation)
            setIsTimerRunning(false)
            if (data.evaluation.pass) {
                toast.success(locale === 'en' ? "Lead Review: Passed! Excellent solution." : "Рев'ю ліда: Зараховано! Відмінне рішення.")
            } else {
                toast.warning(locale === 'en' ? "Lead Review: Needs improvement. Check feedback." : "Рев'ю ліда: Потрібні доопрацювання. Перевірте фідбек.")
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to submit code for review")
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

            {/* Split Workspace: Left = Task Description & Lead Review, Right = Monaco Code Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Requirements & Feedback (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Task Overview Card */}
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

                    {/* Lead Review Result Card */}
                    {evaluation && (
                        <div className={`p-6 rounded-3xl glass-card-premium border shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                            evaluation.pass ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-amber-500/30 bg-amber-500/[0.02]"
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {evaluation.pass ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <span className="text-sm font-bold text-white">
                                        {evaluation.pass
                                            ? (locale === 'en' ? "Lead Review: Passed" : "Перевірка пройдена")
                                            : (locale === 'en' ? "Lead Review: Needs Improvement" : "Потрібні доопрацювання")}
                                    </span>
                                </div>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                                    evaluation.pass ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}>
                                    {evaluation.score}/100
                                </span>
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                {getLocalizedFeedback(evaluation)}
                            </p>

                            {evaluation.codeReviewHighlights?.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        {locale === 'en' ? "Review Notes:" : "Коментарі ліда:"}
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

                {/* Right Column: Code Editor & Actions (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                    <div className="p-4 rounded-3xl glass-card-premium border border-white/10 shadow-xl flex-1 flex flex-col min-h-[620px] lg:min-h-[680px]">
                        {/* Editor Header Bar */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-xs">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-blue-400" />
                                <span className="font-mono text-slate-300 text-xs font-semibold">
                                    test.spec.ts
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={resetCode}
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>{locale === 'en' ? "Reset Code" : (locale === 'ru' ? "Сбросить" : "Скинути")}</span>
                            </button>
                        </div>

                        {/* Monaco Editor Container */}
                        <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 bg-[#1e1e1e] min-h-[500px] lg:min-h-[580px]">
                            <CodeEditor
                                value={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>

                        {/* Action CTA Bar */}
                        <div className="pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                            <span className="text-[11px] text-slate-500">
                                {locale === 'en' ? "TypeScript • Playwright test runner environment" : "Середовище TypeScript • Playwright test runner"}
                            </span>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={submitForReview}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmitting ? (locale === 'en' ? "Reviewing..." : "Перевірка...") : (locale === 'en' ? "Submit for Lead Review" : (locale === 'ru' ? "Сдать на проверку Lead QA" : "Здати на перевірку Lead QA"))}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
