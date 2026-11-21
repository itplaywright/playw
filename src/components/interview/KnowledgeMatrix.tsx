"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
    Award, CheckCircle2, AlertTriangle, HelpCircle, Filter, Search,
    RotateCcw, Sparkles, BookOpen, Layers, Eye, EyeOff, Check, Copy,
    ArrowRight, ChevronLeft, ChevronRight, Shuffle, Star, TrendingUp
} from "lucide-react"
import { INTERVIEW_QUESTIONS_BANK, CuratedQuestion } from "@/lib/interviewBank"
import { toast } from "sonner"

interface Props {
    locale: string
}

type AssessmentRating = 'mastered' | 'unsure' | 'need_practice'

const STORAGE_KEY = 'playwright_knowledge_matrix_v1'

export default function KnowledgeMatrix({ locale }: Props) {
    const [selectedLevel, setSelectedLevel] = useState<'all' | 'junior' | 'middle' | 'senior'>('all')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'unrated' | 'mastered' | 'unsure' | 'need_practice'>('all')
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<'grid' | 'study'>('grid')
    const [studyIndex, setStudyIndex] = useState(0)

    // Question languages toggle per card (cardId -> 'en' | 'uk' | 'ru')
    const [cardLangs, setCardLangs] = useState<Record<number, 'en' | 'uk' | 'ru'>>({})
    // Revealed answer per card (cardId -> boolean)
    const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({})
    // Ratings map (cardId -> AssessmentRating)
    const [ratings, setRatings] = useState<Record<number, AssessmentRating>>({})
    const [copiedId, setCopiedId] = useState<number | null>(null)

    // Load ratings from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                setRatings(JSON.parse(saved))
            }
        } catch (e) {
            console.error("Failed to load knowledge matrix:", e)
        }
    }, [])

    // Save ratings to localStorage
    const setRating = (questionId: number, rating: AssessmentRating) => {
        setRatings(prev => {
            const next = { ...prev, [questionId]: rating }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch (e) {}
            return next
        })
    }

    const resetAllRatings = () => {
        const confirmMsg = locale === 'en'
            ? "Reset your self-assessment ratings for all questions?"
            : (locale === 'ru' ? "Сбросить прогресс самопроверки по всем вопросам?" : "Скинути весь прогрес самооцінки?")
        if (window.confirm(confirmMsg)) {
            setRatings({})
            try {
                localStorage.removeItem(STORAGE_KEY)
            } catch (e) {}
            toast.success(locale === 'en' ? "Progress reset" : "Прогрес скинуто")
        }
    }

    const toggleCardLang = (id: number, lang: 'en' | 'uk' | 'ru') => {
        setCardLangs(prev => ({ ...prev, [id]: lang }))
    }

    const toggleReveal = (id: number) => {
        setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const copyAnswer = (text: string, id: number) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
        toast.success(locale === 'en' ? "Model answer copied" : "Еталонну відповідь скопійовано")
    }

    // Categories list
    const categories = useMemo(() => {
        const set = new Set<string>()
        INTERVIEW_QUESTIONS_BANK.forEach(q => set.add(q.category))
        return Array.from(set)
    }, [])

    // Filtered questions
    const filteredQuestions = useMemo(() => {
        return INTERVIEW_QUESTIONS_BANK.filter(q => {
            if (selectedLevel !== 'all' && q.roleLevel !== selectedLevel) return false
            if (selectedCategory !== 'all' && q.category !== selectedCategory) return false

            const rating = ratings[q.id]
            if (statusFilter === 'mastered' && rating !== 'mastered') return false
            if (statusFilter === 'unsure' && rating !== 'unsure') return false
            if (statusFilter === 'need_practice' && rating !== 'need_practice') return false
            if (statusFilter === 'unrated' && rating) return false

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchEn = q.questionEn.toLowerCase().includes(query)
                const matchUk = q.questionUk.toLowerCase().includes(query)
                const matchRu = q.questionRu.toLowerCase().includes(query)
                const matchCat = q.category.toLowerCase().includes(query)
                const matchKw = q.keywords.some(k => k.toLowerCase().includes(query))
                if (!matchEn && !matchUk && !matchRu && !matchCat && !matchKw) return false
            }

            return true
        })
    }, [selectedLevel, selectedCategory, statusFilter, searchQuery, ratings])

    // Overall metrics
    const totalCount = INTERVIEW_QUESTIONS_BANK.length
    const masteredCount = Object.values(ratings).filter(r => r === 'mastered').length
    const unsureCount = Object.values(ratings).filter(r => r === 'unsure').length
    const needPracticeCount = Object.values(ratings).filter(r => r === 'need_practice').length
    const readinessPct = totalCount > 0 ? Math.round(((masteredCount + unsureCount * 0.5) / totalCount) * 100) : 0

    // Current question in study mode
    const currentStudyQuestion = filteredQuestions[studyIndex] || filteredQuestions[0]

    return (
        <div className="space-y-8">
            {/* Header Hero Stats Bar */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card-premium border border-white/10 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{locale === 'en' ? "Technical Competency Matrix" : (locale === 'ru' ? "Матрица технических компетенций" : "Матриця технічних компетенцій")}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {locale === 'en' ? "Question Bank & Knowledge Self-Assessment" : (locale === 'ru' ? "База вопросов и экспресс-самооценка" : "База запитань та бліц-самоперевірка знань")}
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                            {locale === 'en'
                                ? "Assess your knowledge across 30 enterprise interview questions with Lead Interviewer model answers. Mark questions as Mastered, Unsure, or Need Practice to build your market readiness matrix."
                                : (locale === 'ru'
                                    ? "Оцените свои знания по 30 реальным вопросам собеседований с эталонными ответами Lead QA. Отмечайте статус карточек для формирования матрицы готовности к офферу."
                                    : "Оцініть свої знання за 30 реальними запитаннями співбесід з еталонними відповідями Lead QA. Відмічайте статус карток для побудови матриці готовності до ринку.")}
                        </p>
                    </div>

                    {/* Progress Score Badge */}
                    <div className="flex-shrink-0 flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="text-center">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                                {readinessPct}%
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {locale === 'en' ? "Readiness" : (locale === 'ru' ? "Готовность" : "Готовність")}
                            </span>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>{masteredCount} {locale === 'en' ? "Mastered" : (locale === 'ru' ? "Освоено" : "Опановано")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-amber-400">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>{unsureCount} {locale === 'en' ? "Unsure" : (locale === 'ru' ? "Частично" : "Частково")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-400">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span>{needPracticeCount} {locale === 'en' ? "Practice" : (locale === 'ru' ? "Повторить" : "Повторити")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div
                            className="bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(masteredCount / totalCount) * 100}%` }}
                            title="Mastered"
                        />
                        <div
                            className="bg-amber-500 transition-all duration-500"
                            style={{ width: `${(unsureCount / totalCount) * 100}%` }}
                            title="Unsure"
                        />
                        <div
                            className="bg-red-500 transition-all duration-500"
                            style={{ width: `${(needPracticeCount / totalCount) * 100}%` }}
                            title="Need Practice"
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{masteredCount + unsureCount + needPracticeCount} / {totalCount} {locale === 'en' ? "reviewed" : (locale === 'ru' ? "проверено" : "перевірено")}</span>
                        {Object.keys(ratings).length > 0 && (
                            <button
                                type="button"
                                onClick={resetAllRatings}
                                className="hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>{locale === 'en' ? "Reset progress" : (locale === 'ru' ? "Сбросить прогресс" : "Скинути прогрес")}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search, Filters & View Toggle */}
            <div className="p-4 sm:p-5 rounded-2xl glass-card-premium border border-white/5 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={locale === 'en' ? "Search questions or keywords..." : (locale === 'ru' ? "Поиск по вопросам или ключевым словам..." : "Пошук за запитаннями або ключовими словами...")}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* View Switcher: Grid vs Study Mode */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    viewMode === 'grid' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {locale === 'en' ? "Grid View" : (locale === 'ru' ? "Все карточки" : "Усі картки")} ({filteredQuestions.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('study')
                                    setStudyIndex(0)
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                    viewMode === 'study' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{locale === 'en' ? "Flashcards Mode" : (locale === 'ru' ? "Режим тренажера" : "Режим флеш-карток")}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                    {/* Level Filter */}
                    <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                        {(['all', 'junior', 'middle', 'senior'] as const).map(lvl => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => setSelectedLevel(lvl)}
                                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                                    selectedLevel === lvl ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {lvl === 'all' ? (locale === 'en' ? "All Levels" : (locale === 'ru' ? "Все уровни" : "Усі рівні")) : lvl}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                statusFilter === 'all' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            {locale === 'en' ? "All Statuses" : (locale === 'ru' ? "Все статусы" : "Усі статуси")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('mastered')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'mastered' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{locale === 'en' ? "Mastered" : (locale === 'ru' ? "Освоено" : "Опановано")}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('unsure')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'unsure' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{locale === 'en' ? "Unsure" : (locale === 'ru' ? "Частично" : "Частково")}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('need_practice')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'need_practice' ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>{locale === 'en' ? "Need Practice" : (locale === 'ru' ? "Повторить" : "Повторити")}</span>
                        </button>
                    </div>

                    {/* Category Dropdown */}
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                        <option value="all" className="bg-slate-900 text-white">
                            {locale === 'en' ? "All Categories" : (locale === 'ru' ? "Все категории" : "Усі категорії")} ({categories.length})
                        </option>
                        {categories.map(c => (
                            <option key={c} value={c} className="bg-slate-900 text-white">
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* VIEW MODE 1: STUDY FLASHCARD CAROUSEL */}
            {viewMode === 'study' && currentStudyQuestion && (
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
                        <span>
                            {locale === 'en' ? "Flashcard" : (locale === 'ru' ? "Карточка" : "Картка")} {studyIndex + 1} {locale === 'en' ? "of" : (locale === 'ru' ? "из" : "з")} {filteredQuestions.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={studyIndex === 0}
                                onClick={() => setStudyIndex(prev => Math.max(0, prev - 1))}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                disabled={studyIndex >= filteredQuestions.length - 1}
                                onClick={() => setStudyIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Single Study Card */}
                    <div className="p-8 sm:p-10 rounded-3xl glass-card-premium border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    currentStudyQuestion.roleLevel === 'junior'
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : currentStudyQuestion.roleLevel === 'middle'
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                }`}>
                                    {currentStudyQuestion.roleLevel}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    {currentStudyQuestion.category}
                                </span>
                            </div>

                            {/* Card Language Selector */}
                            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                                <button
                                    type="button"
                                    onClick={() => toggleCardLang(currentStudyQuestion.id, 'en')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        (cardLangs[currentStudyQuestion.id] || 'en') === 'en' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    🇬🇧 EN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleCardLang(currentStudyQuestion.id, 'uk')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        cardLangs[currentStudyQuestion.id] === 'uk' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    🇺🇦 UA
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleCardLang(currentStudyQuestion.id, 'ru')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        cardLangs[currentStudyQuestion.id] === 'ru' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    🇷🇺 RU
                                </button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                                {locale === 'en' ? "Interview Question:" : (locale === 'ru' ? "Вопрос собеседования:" : "Запитання на співбесіді:")}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                                {(cardLangs[currentStudyQuestion.id] || 'en') === 'uk'
                                    ? currentStudyQuestion.questionUk
                                    : (cardLangs[currentStudyQuestion.id] === 'ru'
                                        ? currentStudyQuestion.questionRu
                                        : currentStudyQuestion.questionEn)}
                            </h3>
                        </div>

                        {/* Keywords Pill tags */}
                        {currentStudyQuestion.keywords?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">
                                    {locale === 'en' ? "Key concepts:" : "Ключові концепції:"}
                                </span>
                                {currentStudyQuestion.keywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] font-mono text-slate-300">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Reveal / Flip Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => toggleReveal(currentStudyQuestion.id)}
                                className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 hover:border-blue-500/30"
                            >
                                {revealedCards[currentStudyQuestion.id] ? (
                                    <>
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                        <span>{locale === 'en' ? "Hide Model Answer" : (locale === 'ru' ? "Скрыть эталонный ответ" : "Приховати еталонну відповідь")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 text-emerald-400" />
                                        <span>{locale === 'en' ? "Reveal Lead QA Model Answer" : (locale === 'ru' ? "Показать эталонный ответ Lead QA" : "Показати еталонну відповідь Lead QA")}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Revealed Ideal Answer */}
                        {revealedCards[currentStudyQuestion.id] && (
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{locale === 'en' ? "Lead QA Model Answer:" : (locale === 'ru' ? "Эталонный ответ Lead QA:" : "Еталонна відповідь Lead QA:")}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const ans = (cardLangs[currentStudyQuestion.id] || 'en') === 'uk'
                                                ? currentStudyQuestion.idealAnswerUk
                                                : (cardLangs[currentStudyQuestion.id] === 'ru'
                                                    ? currentStudyQuestion.idealAnswerRu
                                                    : currentStudyQuestion.idealAnswerEn)
                                            copyAnswer(ans, currentStudyQuestion.id)
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Copy"
                                    >
                                        {copiedId === currentStudyQuestion.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                                    {(cardLangs[currentStudyQuestion.id] || 'en') === 'uk'
                                        ? currentStudyQuestion.idealAnswerUk
                                        : (cardLangs[currentStudyQuestion.id] === 'ru'
                                            ? currentStudyQuestion.idealAnswerRu
                                            : currentStudyQuestion.idealAnswerEn)}
                                </p>
                            </div>
                        )}

                        {/* Self Assessment Rating Actions */}
                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
                                {locale === 'en' ? "How well do you know this topic?" : (locale === 'ru' ? "Насколько уверенно вы знаете эту тему?" : "Наскільки впевнено ви знаєте цю тему?")}
                            </span>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRating(currentStudyQuestion.id, 'need_practice')
                                        if (studyIndex < filteredQuestions.length - 1) setStudyIndex(prev => prev + 1)
                                    }}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                                        ratings[currentStudyQuestion.id] === 'need_practice'
                                            ? "bg-red-500/20 text-red-300 border-red-500/50 ring-2 ring-red-500/30"
                                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-red-500/10 hover:text-red-400"
                                    }`}
                                >
                                    🔴 {locale === 'en' ? "Need Practice" : (locale === 'ru' ? "Повторить" : "Повторити")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRating(currentStudyQuestion.id, 'unsure')
                                        if (studyIndex < filteredQuestions.length - 1) setStudyIndex(prev => prev + 1)
                                    }}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                                        ratings[currentStudyQuestion.id] === 'unsure'
                                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-500/30"
                                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-amber-500/10 hover:text-amber-400"
                                    }`}
                                >
                                    🟡 {locale === 'en' ? "Partially Know" : (locale === 'ru' ? "Частично" : "Частково")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRating(currentStudyQuestion.id, 'mastered')
                                        if (studyIndex < filteredQuestions.length - 1) setStudyIndex(prev => prev + 1)
                                    }}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                                        ratings[currentStudyQuestion.id] === 'mastered'
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/30"
                                            : "bg-white/5 text-slate-400 border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400"
                                    }`}
                                >
                                    🟢 {locale === 'en' ? "Mastered" : (locale === 'ru' ? "Освоено" : "Опановано")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODE 2: GRID OF CARDS */}
            {viewMode === 'grid' && (
                <>
                    {filteredQuestions.length === 0 ? (
                        <div className="p-16 rounded-3xl glass-card-premium border border-white/5 text-center space-y-3">
                            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
                            <h3 className="text-lg font-bold text-white">
                                {locale === 'en' ? "No questions match your filter criteria" : (locale === 'ru' ? "Нет вопросов по выбранным фильтрам" : "Немає запитань за обраними фільтрами")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedLevel('all')
                                    setSelectedCategory('all')
                                    setStatusFilter('all')
                                    setSearchQuery('')
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                            >
                                {locale === 'en' ? "Clear all filters" : (locale === 'ru' ? "Сбросить фильтры" : "Скинути фільтри")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredQuestions.map((q) => {
                                const cardLang = cardLangs[q.id] || 'en'
                                const isRevealed = revealedCards[q.id] || false
                                const currentRating = ratings[q.id]

                                const questionText = cardLang === 'uk'
                                    ? q.questionUk
                                    : (cardLang === 'ru' ? q.questionRu : q.questionEn)

                                const answerText = cardLang === 'uk'
                                    ? q.idealAnswerUk
                                    : (cardLang === 'ru' ? q.idealAnswerRu : q.idealAnswerEn)

                                return (
                                    <div
                                        key={q.id}
                                        className={`p-6 rounded-3xl glass-card-premium border transition-all duration-300 flex flex-col justify-between space-y-5 ${
                                            currentRating === 'mastered'
                                                ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                                                : currentRating === 'unsure'
                                                ? "border-amber-500/30 bg-amber-500/[0.02]"
                                                : currentRating === 'need_practice'
                                                ? "border-red-500/30 bg-red-500/[0.02]"
                                                : "border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        <div className="space-y-4">
                                            {/* Card Top: Badges & Language Switcher */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                        q.roleLevel === 'junior'
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : q.roleLevel === 'middle'
                                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                    }`}>
                                                        {q.roleLevel}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-400 truncate max-w-[180px]">
                                                        {q.category}
                                                    </span>
                                                </div>

                                                {/* Lang Switcher */}
                                                <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCardLang(q.id, 'en')}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            cardLang === 'en' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                                        }`}
                                                    >
                                                        EN
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCardLang(q.id, 'uk')}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            cardLang === 'uk' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                                        }`}
                                                    >
                                                        UA
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCardLang(q.id, 'ru')}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                            cardLang === 'ru' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                                        }`}
                                                    >
                                                        RU
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Question Text */}
                                            <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                                                {questionText}
                                            </h4>

                                            {/* Keywords */}
                                            {q.keywords?.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {q.keywords.slice(0, 4).map((kw, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reveal Answer Button */}
                                            <button
                                                type="button"
                                                onClick={() => toggleReveal(q.id)}
                                                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/5"
                                            >
                                                {isRevealed ? (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{locale === 'en' ? "Hide Model Answer" : (locale === 'ru' ? "Скрыть ответ" : "Приховати відповідь")}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>{locale === 'en' ? "Show Lead Model Answer" : (locale === 'ru' ? "Показать эталонный ответ" : "Показати еталонну відповідь")}</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Model Answer Drawer */}
                                            {isRevealed && (
                                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in fade-in duration-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                                            {locale === 'en' ? "Lead QA Answer:" : (locale === 'ru' ? "Ответ Lead QA:" : "Відповідь Lead QA:")}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyAnswer(answerText, q.id)}
                                                            className="p-1 text-slate-400 hover:text-white"
                                                            title="Copy"
                                                        >
                                                            {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                                        {answerText}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assessment Rating Buttons */}
                                        <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setRating(q.id, 'need_practice')}
                                                className={`py-1.5 px-2 rounded-lg transition-all border text-center ${
                                                    currentRating === 'need_practice'
                                                        ? "bg-red-500/25 text-red-300 border-red-500/60"
                                                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-red-500/10 hover:text-red-400"
                                                }`}
                                            >
                                                🔴 {locale === 'en' ? "Practice" : (locale === 'ru' ? "Повторить" : "Повторити")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRating(q.id, 'unsure')}
                                                className={`py-1.5 px-2 rounded-lg transition-all border text-center ${
                                                    currentRating === 'unsure'
                                                        ? "bg-amber-500/25 text-amber-300 border-amber-500/60"
                                                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-amber-500/10 hover:text-amber-400"
                                                }`}
                                            >
                                                🟡 {locale === 'en' ? "Unsure" : (locale === 'ru' ? "Частично" : "Частково")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRating(q.id, 'mastered')}
                                                className={`py-1.5 px-2 rounded-lg transition-all border text-center ${
                                                    currentRating === 'mastered'
                                                        ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/60"
                                                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                }`}
                                            >
                                                🟢 {locale === 'en' ? "Mastered" : (locale === 'ru' ? "Освоено" : "Опановано")}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
