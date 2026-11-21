"use client"

import React, { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import {
    Mic, MicOff, Send, Award, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw,
    ChevronRight, BookOpen, Clock, User, BarChart2, HelpCircle, Layers, Check, Copy, Flame,
    Briefcase, UserCheck, Code2
} from "lucide-react"
import { toast } from "sonner"
import KnowledgeMatrix from "./KnowledgeMatrix"
import LiveCodingChallenge from "./LiveCodingChallenge"

interface QuestionData {
    order: number
    category: string
    questionEn: string
    questionUk?: string
    questionRu?: string
}

interface EvaluationData {
    score: number
    evaluationEn: string
    evaluationUk?: string
    evaluationRu?: string
    mistakesEn?: string
    mistakesUk?: string
    mistakesRu?: string
    idealAnswerEn?: string
    idealAnswerUk?: string
    idealAnswerRu?: string
}

interface FinalReportData {
    totalScore: number
    readinessLevel: string
    summaryEn: string
    summaryUk?: string
    summaryRu?: string
    strengths: string[]
    improvements: string[]
}

interface InterviewSessionHistory {
    id: string
    roleLevel: string
    status: string
    totalScore: number | null
    createdAt: string | Date
    feedback?: any
}

interface Props {
    locale: string
    userName: string
    initialHistory: InterviewSessionHistory[]
}

export default function InterviewClient({ locale, userName, initialHistory }: Props) {
    const t = useTranslations("Interview")

    // State machine: 'setup' | 'interviewing' | 'completed'
    const [viewMode, setViewMode] = useState<'setup' | 'interviewing' | 'completed'>('setup')
    const [mainTab, setMainTab] = useState<'interview' | 'matrix' | 'coding'>('interview')
    const [selectedLevel, setSelectedLevel] = useState<'junior' | 'middle' | 'senior'>('junior')
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [history, setHistory] = useState<InterviewSessionHistory[]>(initialHistory)

    // Active session state
    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
    const [totalQuestions, setTotalQuestions] = useState(5)
    const [questionLang, setQuestionLang] = useState<'en' | 'uk' | 'ru'>('en')
    const [studentAnswer, setStudentAnswer] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationData | null>(null)
    const [nextQuestionPending, setNextQuestionPending] = useState<QuestionData | null>(null)
    const [finalReport, setFinalReport] = useState<FinalReportData | null>(null)
    const [allReviewedQuestions, setAllReviewedQuestions] = useState<any[]>([])

    // Voice recognition (Speech to Text)
    const [isRecording, setIsRecording] = useState(false)
    const recognitionRef = useRef<any>(null)
    const [copiedAnswer, setCopiedAnswer] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = questionLang === 'en' ? 'en-US' : (questionLang === 'ru' ? 'ru-RU' : 'uk-UA')

                recognition.onresult = (event: any) => {
                    let transcript = ""
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript
                    }
                    setStudentAnswer(prev => prev + " " + transcript)
                }

                recognition.onerror = () => {
                    setIsRecording(false)
                }

                recognition.onend = () => {
                    setIsRecording(false)
                }

                recognitionRef.current = recognition
            }
        }
    }, [questionLang])

    const toggleSpeechRecognition = () => {
        if (!recognitionRef.current) {
            toast.error(locale === 'en' ? "Voice input not supported in this browser." : "Голосове введення не підтримується у цьому браузері.")
            return
        }

        if (isRecording) {
            recognitionRef.current.stop()
            setIsRecording(false)
        } else {
            try {
                recognitionRef.current.lang = questionLang === 'en' ? 'en-US' : (questionLang === 'ru' ? 'ru-RU' : 'uk-UA')
                recognitionRef.current.start()
                setIsRecording(true)
                toast.success(locale === 'en' ? "Listening... Speak now." : "Мікрофон увімкнено... Говоріть.")
            } catch (err) {
                setIsRecording(false)
            }
        }
    }

    const startInterview = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/interview/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleLevel: selectedLevel, stack: "typescript" })
            })

            if (!res.ok) throw new Error("Failed to start")
            const data = await res.json()

            setSessionId(data.sessionId)
            setCurrentQuestion(data.currentQuestion)
            setTotalQuestions(data.totalQuestions || 5)
            setStudentAnswer("")
            setCurrentEvaluation(null)
            setNextQuestionPending(null)
            setFinalReport(null)
            setAllReviewedQuestions([])
            setQuestionLang('en') // English by default
            setViewMode('interviewing')
        } catch {
            toast.error(locale === 'en' ? "Error starting session" : "Помилка при старті інтерв'ю")
        } finally {
            setIsSubmitting(false)
        }
    }

    const submitAnswer = async () => {
        if (!studentAnswer.trim()) {
            toast.error(locale === 'en' ? "Please formulate your answer before submitting." : "Будь ласка, введіть вашу відповідь перед відправкою.")
            return
        }

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsRecording(false)
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/interview/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    questionOrder: currentQuestion?.order,
                    studentAnswer
                })
            })

            if (!res.ok) throw new Error("Evaluation error")
            const data = await res.json()

            setCurrentEvaluation(data.evaluation)

            if (data.isFinished) {
                setFinalReport(data.finalReport)
                setAllReviewedQuestions(data.allQuestions || [])
                setNextQuestionPending(null)
            } else {
                setNextQuestionPending(data.nextQuestion)
            }
        } catch {
            toast.error(locale === 'en' ? "Failed to evaluate answer." : "Помилка при оцінці відповіді.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const proceedToNextQuestion = () => {
        if (nextQuestionPending) {
            setCurrentQuestion(nextQuestionPending)
            setNextQuestionPending(null)
            setCurrentEvaluation(null)
            setStudentAnswer("")
            setQuestionLang('en') // reset to English for next question
        } else if (finalReport) {
            setViewMode('completed')
            // Refresh history
            fetch("/api/interview/history")
                .then(r => r.json())
                .then(d => { if (d.history) setHistory(d.history) })
                .catch(() => {})
        }
    }

    const copyIdealAnswer = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedAnswer(true)
        setTimeout(() => setCopiedAnswer(false), 2000)
        toast.success(locale === 'en' ? "Copied to clipboard!" : "Скопійовано!")
    }

    // Question text in selected language
    const displayedQuestionText = questionLang === 'en'
        ? currentQuestion?.questionEn
        : questionLang === 'uk'
            ? (currentQuestion?.questionUk || currentQuestion?.questionEn)
            : (currentQuestion?.questionRu || currentQuestion?.questionEn)

    // Feedback in user's UI language
    const getEvaluationText = (ev: EvaluationData) => {
        if (locale === 'uk') return ev.evaluationUk || ev.evaluationEn
        if (locale === 'ru') return ev.evaluationRu || ev.evaluationEn
        return ev.evaluationEn
    }

    const getMistakesText = (ev: EvaluationData) => {
        if (locale === 'uk') return ev.mistakesUk || ev.mistakesEn
        if (locale === 'ru') return ev.mistakesRu || ev.mistakesEn
        return ev.mistakesEn
    }

    const getIdealAnswerText = (ev: EvaluationData) => {
        if (questionLang === 'uk') return ev.idealAnswerUk || ev.idealAnswerEn
        if (questionLang === 'ru') return ev.idealAnswerRu || ev.idealAnswerEn
        return ev.idealAnswerEn
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden pb-16">
            {/* Mesh Background */}
            <div className="mesh-gradient-container pointer-events-none">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
                {/* Mode Switcher Tabs */}
                {viewMode === 'setup' && (
                    <div className="flex items-center justify-center">
                        <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg backdrop-blur-md gap-2">
                            <button
                                type="button"
                                onClick={() => setMainTab('interview')}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                                    mainTab === 'interview'
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>{locale === 'en' ? "1. Live Interview" : (locale === 'ru' ? "1. Собеседование" : "1. Співбесіда")}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMainTab('matrix')}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                                    mainTab === 'matrix'
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span>{locale === 'en' ? "2. Knowledge Matrix" : (locale === 'ru' ? "2. Матрица знаний" : "2. Матриця знань")}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMainTab('coding')}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                                    mainTab === 'coding'
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Code2 className="w-4 h-4" />
                                <span>{locale === 'en' ? "3. Live Coding Challenge" : (locale === 'ru' ? "3. Лайв-кодинг" : "3. Лайв-кодинг")}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. LIVE CODING CHALLENGE TAB */}
                {viewMode === 'setup' && mainTab === 'coding' && (
                    <LiveCodingChallenge locale={locale} />
                )}

                {/* 2. KNOWLEDGE MATRIX / FLASHCARDS TAB */}
                {viewMode === 'setup' && mainTab === 'matrix' && (
                    <KnowledgeMatrix locale={locale} />
                )}

                {/* 1. SETUP / HOME SCREEN */}
                {viewMode === 'setup' && mainTab === 'interview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Hero Header */}
                        <div className="p-8 sm:p-10 rounded-3xl glass-card-premium border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-3 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                                        <Briefcase className="w-4 h-4" />
                                        <span>Technical Interview Simulator</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                        {locale === 'en' && "Technical Interview & Skills Assessment"}
                                        {locale === 'uk' && "Технічна співбесіда та оцінка кваліфікації"}
                                        {locale === 'ru' && "Техническое собеседование и оценка квалификации"}
                                    </h1>
                                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                                        {locale === 'en' && "Practice real interview questions asked at top tech companies. Questions are presented in authentic English with instant Ukrainian and Russian translations, reviewed according to enterprise automation standards."}
                                        {locale === 'uk' && "Тренуйтеся відповідати на реальні запитання топ-компаній. Запитання подаються професійною англійською мовою з миттєвим перекладом, а ваші відповіді оцінюються за критеріями реального технічного інтерв'ю."}
                                        {locale === 'ru' && "Тренируйтесь отвечать на реальные вопросы топ-компаний. Вопросы подаются на профессиональном английском языке с моментальным переводом, а ваши ответы оцениваются по критериям реального технического интервью."}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                        <Award className="w-10 h-10 text-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grade Level Selection */}
                        <div className="p-8 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">
                                    {locale === 'en' ? "1. Select Target Seniority Level" : (locale === 'ru' ? "1. Выберите желаемый грейд" : "1. Оберіть бажаний грейд")}
                                </h2>
                                <p className="text-slate-400 text-xs">
                                    {locale === 'en' ? "Questions and criteria will adapt to the expected depth for this level." : (locale === 'ru' ? "Вопросы и критерии адаптируются под ожидаемую глубину грейда." : "Запитання та критерії оцінки адаптуються під очікувану глибину рівня.")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* JUNIOR */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedLevel('junior')}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                                        selectedLevel === 'junior'
                                            ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            Junior Level
                                        </span>
                                        {selectedLevel === 'junior' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">Junior QA Automation</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        {locale === 'en' ? "Core Playwright locators, auto-waiting, basic assertions, browser contexts, and trace debugging." : (locale === 'ru' ? "Локаторы Playwright, auto-waiting, базовые ассерты, изоляция сессий и дебаг." : "Локатори Playwright, auto-waiting, базові асершни, ізоляція сесій та дебаг.")}
                                    </p>
                                </button>

                                {/* MIDDLE */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedLevel('middle')}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                                        selectedLevel === 'middle'
                                            ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                            Middle Level
                                        </span>
                                        {selectedLevel === 'middle' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">Middle QA Automation</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        {locale === 'en' ? "Page Object Model, custom fixtures, storageState, network route mocking, and API request context." : (locale === 'ru' ? "Архитектура POM, кастомные фикстуры, storageState, мокирование сети и API тесты." : "Архітектура POM, кастомні фікстури, storageState, мокування мережі та API тести.")}
                                    </p>
                                </button>

                                {/* SENIOR */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedLevel('senior')}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                                        selectedLevel === 'senior'
                                            ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                            Senior Level
                                        </span>
                                        {selectedLevel === 'senior' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">Senior / Lead QA</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        {locale === 'en' ? "CI/CD matrix sharding, flakiness root-cause analysis, custom reporters, Docker, visual regression." : (locale === 'ru' ? "Масштабирование CI/CD, шардинг, борьба с flakiness, кастомные репортеры и Docker." : "Масштабування CI/CD, шардинг, боротьба з flakiness, кастомні репортери та Docker.")}
                                    </p>
                                </button>
                            </div>

                            {/* Action CTA */}
                            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span>5 {locale === 'en' ? "technical questions • ~10-15 minutes" : (locale === 'ru' ? "технических вопросов • ~10-15 минут" : "технічних питань • ~10-15 хвилин")}</span>
                                </div>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={startInterview}
                                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>{locale === 'en' ? "Start Technical Interview" : (locale === 'ru' ? "Начать собеседование" : "Розпочати співбесіду")}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Recent History */}
                        {history.length > 0 && (
                            <div className="p-8 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-blue-400" />
                                    <span>{locale === 'en' ? "Your Past Interview Sessions" : (locale === 'ru' ? "История ваших собеседований" : "Історія ваших співбесід")}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.map(s => (
                                        <div key={s.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    {s.roleLevel}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline justify-between pt-1">
                                                <span className="text-xs text-slate-400">Score:</span>
                                                <span className={`text-lg font-black ${
                                                    (s.totalScore || 0) >= 80 ? "text-emerald-400" : (s.totalScore || 0) >= 60 ? "text-amber-400" : "text-slate-400"
                                                }`}>
                                                    {s.totalScore !== null ? `${s.totalScore}/100` : "In Progress"}
                                                </span>
                                            </div>
                                            {s.feedback?.readinessLevel && (
                                                <p className="text-[11px] text-slate-300 font-medium truncate">
                                                    {s.feedback.readinessLevel}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. ACTIVE INTERVIEWING SCREEN */}
                {viewMode === 'interviewing' && currentQuestion && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Progress Header */}
                        <div className="p-4 rounded-2xl glass-card-premium border border-white/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    {selectedLevel.toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                    {locale === 'en' ? "Question" : (locale === 'ru' ? "Вопрос" : "Питання")} {currentQuestion.order} {locale === 'en' ? "of" : (locale === 'ru' ? "из" : "з")} {totalQuestions}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="flex-1 max-w-xs hidden sm:block">
                                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${(currentQuestion.order / totalQuestions) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewMode('setup')}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                {locale === 'en' ? "Exit Interview" : (locale === 'ru' ? "Завершить" : "Завершити")}
                            </button>
                        </div>

                        {/* Question Box */}
                        <div className="p-6 sm:p-8 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-5">
                            {/* Category & Language Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400">
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>{currentQuestion.category}</span>
                                </div>

                                {/* Language Switcher for Question */}
                                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuestionLang('en')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            questionLang === 'en' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        🇬🇧 English (Original)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuestionLang('uk')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            questionLang === 'uk' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {locale === 'en' ? "🇺🇦 Translation (UA)" : "🇺🇦 Переклад (UA)"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuestionLang('ru')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                            questionLang === 'ru' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {locale === 'en' ? "🇷🇺 Translation (RU)" : "🇷🇺 Перевод (RU)"}
                                    </button>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5" title="Lead Interviewer">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                                        {displayedQuestionText}
                                    </h2>
                                </div>
                            </div>

                            {/* Student Answer Form */}
                            {!currentEvaluation && (
                                <div className="space-y-3 pt-2">
                                    <div className="relative">
                                        <textarea
                                            value={studentAnswer}
                                            onChange={e => setStudentAnswer(e.target.value)}
                                            rows={6}
                                            placeholder={
                                                locale === 'en'
                                                    ? "Type your answer here in English or your native language. Mention core mechanisms, best practices, or architectural reasoning..."
                                                    : (locale === 'ru'
                                                        ? "Введите ваш ответ здесь. Опишите механизмы, лучшие практики или архитектурный подход..."
                                                        : "Введіть вашу відповідь тут. Опишіть механізми, найкращі практики чи архітектурний підхід...")
                                            }
                                            className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans leading-relaxed resize-y"
                                        />

                                        {/* Mic dictation button */}
                                        <button
                                            type="button"
                                            onClick={toggleSpeechRecognition}
                                            className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all ${
                                                isRecording
                                                    ? "bg-red-500 text-white animate-pulse"
                                                    : "bg-white/10 hover:bg-white/20 text-slate-300"
                                            }`}
                                            title="Voice dictation"
                                        >
                                            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <p className="text-[11px] text-slate-500">
                                            {locale === 'en' ? "Tip: You can answer in English, Ukrainian, or Russian. Your answer is evaluated against enterprise automation standards." : (locale === 'ru' ? "Подсказка: Вы можете отвечать на русском или английском. Ответ оценивается по стандартам реального технического интервью." : "Підказка: Ви можете відповідати українською чи англійською. Відповідь оцінюється за стандартами реального технічного інтерв'ю.")}
                                        </p>

                                        <button
                                            type="button"
                                            disabled={isSubmitting || !studentAnswer.trim()}
                                            onClick={submitAnswer}
                                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>{locale === 'en' ? "Reviewing answer..." : (locale === 'ru' ? "Проверка ответа..." : "Перевірка відповіді...")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>{locale === 'en' ? "Submit Answer" : "Відповісти"}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Evaluation Box (Appears after answer submitted) */}
                            {currentEvaluation && (
                                <div className="space-y-5 pt-4 border-t border-white/10 animate-in fade-in duration-300">
                                    {/* Score Banner */}
                                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                        currentEvaluation.score >= 80
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : currentEvaluation.score >= 60
                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                                : "bg-red-500/10 border-red-500/30 text-red-400"
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <Award className="w-6 h-6" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Score</p>
                                                <p className="text-xl font-black">{currentEvaluation.score} / 100</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold">
                                            {currentEvaluation.score >= 80 ? "Excellent" : currentEvaluation.score >= 60 ? "Solid Answer" : "Needs Review"}
                                        </span>
                                    </div>

                                    {/* AI Feedback */}
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                                {locale === 'en' ? "Interviewer Feedback & Key Strengths:" : (locale === 'ru' ? "Фидбек интервьюера:" : "Фідбек від інтерв'юера:")}
                                            </p>
                                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                                {getEvaluationText(currentEvaluation)}
                                            </p>
                                        </div>

                                        {currentEvaluation.mistakesEn && currentEvaluation.mistakesEn !== "None." && (
                                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    <span>{locale === 'en' ? "Missing Points or Gaps:" : (locale === 'ru' ? "Чего не хватило или что исправить:" : "Чого не вистачило або що виправити:")}</span>
                                                </p>
                                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                                    {getMistakesText(currentEvaluation)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Ideal Model Answer */}
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>{locale === 'en' ? "Ideal Model Answer:" : (locale === 'ru' ? "Эталонный ответ на собеседовании:" : "Еталонна відповідь на співбесіді:")}</span>
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => copyIdealAnswer(getIdealAnswerText(currentEvaluation) || "")}
                                                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                                    title="Copy"
                                                >
                                                    {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                                                {getIdealAnswerText(currentEvaluation)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Next Question CTA */}
                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={proceedToNextQuestion}
                                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <span>{nextQuestionPending ? (locale === 'en' ? "Next Question" : (locale === 'ru' ? "Следующий вопрос" : "Наступне питання")) : (locale === 'en' ? "View Final Report" : (locale === 'ru' ? "Итоговый отчет" : "Отримати підсумковий звіт"))}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. COMPLETED INTERVIEW PERFORMANCE REPORT */}
                {viewMode === 'completed' && finalReport && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Summary Scorecard */}
                        <div className="p-8 sm:p-10 rounded-3xl glass-card-premium border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Interview Completed
                                    </span>
                                    <h2 className="text-3xl font-black text-white">
                                        {finalReport.readinessLevel}
                                    </h2>
                                    <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                                        {locale === 'uk' ? finalReport.summaryUk : locale === 'ru' ? finalReport.summaryRu : finalReport.summaryEn}
                                    </p>
                                </div>

                                {/* Score Wheel Badge */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-3xl bg-blue-600/20 border border-blue-500/30 shadow-xl shadow-blue-500/10">
                                    <span className="text-4xl font-black text-white">{finalReport.totalScore}%</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Total Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl glass-card-premium border border-emerald-500/20 shadow-xl space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{locale === 'en' ? "Demonstrated Strengths" : (locale === 'ru' ? "Сильные стороны кандидата" : "Сильні сторони кандидата")}</span>
                                </h3>
                                <ul className="space-y-2">
                                    {finalReport.strengths.map((s, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                                            <span className="text-emerald-400 font-bold">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 rounded-3xl glass-card-premium border border-amber-500/20 shadow-xl space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{locale === 'en' ? "Recommended Areas for Practice" : (locale === 'ru' ? "Зоны для улучшения и практики" : "Зони для покращення та практики")}</span>
                                </h3>
                                <ul className="space-y-2">
                                    {finalReport.improvements.map((imp, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                                            <span className="text-amber-400 font-bold">•</span>
                                            <span>{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Detailed Question by Question Transcript */}
                        {allReviewedQuestions.length > 0 && (
                            <div className="p-6 sm:p-8 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-4">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {locale === 'en' ? "Full Interview Transcript" : (locale === 'ru' ? "Детальный разбор всех ответов" : "Детальний розбір усіх відповідей")}
                                </h3>
                                <div className="space-y-4">
                                    {allReviewedQuestions.map((q, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-400">
                                                    #{q.order}. {q.category}
                                                </span>
                                                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                                                    (q.score || 0) >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                                                }`}>
                                                    {q.score}/100
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-semibold text-white">
                                                {q.questionEn}
                                            </p>
                                            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Your answer:</span>
                                                {q.studentAnswer || <span className="italic text-slate-500">No answer</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setViewMode('setup')}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>{locale === 'en' ? "Start Another Technical Interview" : (locale === 'ru' ? "Пройти еще одно собеседование" : "Пройти ще одну співбесіду")}</span>
                            </button>

                            <Link
                                href="/dashboard"
                                className="px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
                            >
                                {locale === 'en' ? "Return to Dashboard" : (locale === 'ru' ? "Вернуться к обучению" : "Повернутися до навчання")}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
