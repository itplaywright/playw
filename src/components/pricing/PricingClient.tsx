"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import {
    Check, X, Zap, Crown, Shield, Star, Sparkles, Terminal, ArrowRight,
    HelpCircle, ChevronDown, MessageSquare, Award, Laptop, Users, Code2,
    CheckCircle2, Flame, Bot, Briefcase, FileCode, Clock, Send
} from "lucide-react"

export interface ProductItem {
    id: number
    title: string
    description: string | null
    price: number
    currency: string
    type: string
    durationMonths: number | null
    grantedRoleId: number | null
    isActive: boolean | null
}

interface PricingClientProps {
    products: ProductItem[]
    currentRoleId?: number | null
    isAuthenticated: boolean
    userEmail?: string | null
}

export default function PricingClient({
    products,
    currentRoleId,
    isAuthenticated,
    userEmail
}: PricingClientProps) {
    const t = useTranslations("Pricing")
    const locale = useLocale()

    const [activeTab, setActiveTab] = useState<"all" | "individual" | "team">("all")
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [selectedStack, setSelectedStack] = useState<"ts" | "py" | "cs">("ts")

    // Sort products logically: Demo (1), Base (2), Pro (3), B2B (4)
    const sortedProducts = [...products].sort((a, b) => {
        const orderMap: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4 }
        return (orderMap[a.id] || 99) - (orderMap[b.id] || 99)
    })

    // Filter products based on active tab
    const filteredProducts = sortedProducts.filter(p => {
        if (activeTab === "individual") return p.id !== 4
        if (activeTab === "team") return p.id === 4 || p.id === 3
        return true
    })

    // Plan features configuration for each product
    const getPlanFeatures = (productId: number) => {
        switch (productId) {
            case 1: // Demo
                return [
                    { text: locale === 'en' ? "Level 0: TypeScript Basics" : locale === 'ru' ? "Уровень 0: Основы TypeScript" : "Рівень 0: Основи TypeScript", included: true },
                    { text: locale === 'en' ? "In-browser live test runner" : locale === 'ru' ? "Запуск тестов в браузере" : "Вбудований запуск тестів у браузері", included: true },
                    { text: locale === 'en' ? "15 interactive practice lessons" : locale === 'ru' ? "15 практических уроков" : "15 практичних уроків", included: true },
                    { text: locale === 'en' ? "Official Playwright theory" : locale === 'ru' ? "Теория Playwright" : "Теорія Playwright та документація", included: true },
                    { text: locale === 'en' ? "Levels 1–10 (POM, CI/CD, Auth)" : locale === 'ru' ? "Уровни 1–10 (POM, CI/CD, Auth)" : "Рівні 1–10 (POM, CI/CD, Auth)", included: false },
                    { text: locale === 'en' ? "Real Jira projects & sprints" : locale === 'ru' ? "Реальные Jira проекты" : "Реальні проєкти в Jira", included: false },
                    { text: locale === 'en' ? "AI Mock Interview simulator" : locale === 'ru' ? "Симулятор собеседований" : "Симулятор співбесід з AI", included: false },
                    { text: locale === 'en' ? "Senior Mentor code review" : locale === 'ru' ? "Ревью кода ментором" : "Рев'ю коду діючим ментором", included: false },
                    { text: locale === 'en' ? "Certificate of Completion" : locale === 'ru' ? "Сертификат об окончании" : "Сертифікат про закінчення", included: false },
                ]
            case 2: // Base
                return [
                    { text: locale === 'en' ? "Levels 0–3 (Core Playwright & POM)" : locale === 'ru' ? "Уровни 0–3 (База Playwright и POM)" : "Рівні 0–3 (База Playwright та POM)", included: true },
                    { text: locale === 'en' ? "60+ hands-on coding tasks" : locale === 'ru' ? "60+ практических задач" : "60+ практичних завдань у браузері", included: true },
                    { text: locale === 'en' ? "Full access to Jira sprint boards" : locale === 'ru' ? "Доступ к Jira доскам проектов" : "Доступ до Jira дошок проєктів", included: true },
                    { text: locale === 'en' ? "Instant AI Code Review & hints" : locale === 'ru' ? "AI-ревью кода и подсказки 24/7" : "ШІ-перевірка коду (AI Code Review)", included: true },
                    { text: locale === 'en' ? "Lifetime access to purchased levels" : locale === 'ru' ? "Пожизненный доступ к уровням 0–3" : "Довічний доступ до рівнів 0–3", included: true },
                    { text: locale === 'en' ? "Levels 4–10 (Senior Architecture)" : locale === 'ru' ? "Уровни 4–10 (Senior практики)" : "Рівні 4–10 (Senior практики)", included: false },
                    { text: locale === 'en' ? "AI Mock Interview simulator" : locale === 'ru' ? "Симулятор собеседований" : "Симулятор співбесід з AI", included: false },
                    { text: locale === 'en' ? "Human Senior Mentor review" : locale === 'ru' ? "Ручная проверка ментором" : "Ручна перевірка ментором", included: false },
                    { text: locale === 'en' ? "Official Graduate Certificate" : locale === 'ru' ? "Официальный сертификат" : "Офіційний сертифікат платформи", included: false },
                ]
            case 3: // Pro
                return [
                    { text: locale === 'en' ? "Full access to all 10 Levels (0–10)" : locale === 'ru' ? "Полный доступ ко всем 10 уровням" : "Повний доступ до всіх 10 рівнів", included: true, highlight: true },
                    { text: locale === 'en' ? "150+ real-world automation challenges" : locale === 'ru' ? "150+ реальных задач автоматизации" : "150+ реальних завдань автоматизації", included: true },
                    { text: locale === 'en' ? "Real Jira projects with test cases" : locale === 'ru' ? "Реальные Jira проекты и спринты" : "Реальні проєкти в Jira (Agile спринти)", included: true },
                    { text: locale === 'en' ? "AI Mock Interview Simulator with Live Coding" : locale === 'ru' ? "Симулятор собеседований с Live-кодингом" : "Симулятор співбесід (AI Mock Interview)", included: true, highlight: true },
                    { text: locale === 'en' ? "Live Senior QA Mentor code reviews" : locale === 'ru' ? "Проверка кода живым Senior ментором" : "Рев'ю коду діючим Senior ментором", included: true, highlight: true },
                    { text: locale === 'en' ? "Telegram notifications for reviewed code" : locale === 'ru' ? "Telegram уведомления о ревью" : "Telegram сповіщення про перевірку", included: true },
                    { text: locale === 'en' ? "AI Assistant & code hints 24/7" : locale === 'ru' ? "ШИ-помощник и разбор ошибок 24/7" : "ШІ-помічник та розбір помилок 24/7", included: true },
                    { text: locale === 'en' ? "Verified Certificate with unique ID" : locale === 'ru' ? "Именной сертификат с проверкой ID" : "Іменний сертифікат з унікальним ID", included: true },
                    { text: locale === 'en' ? "Private Telegram QA community access" : locale === 'ru' ? "Закрытое сообщество автоматизаторов" : "Доступ до закритої спільноти QA", included: true },
                ]
            case 4: // B2B
                return [
                    { text: locale === 'en' ? "Everything in Pro for up to 10 engineers" : locale === 'ru' ? "Всё из тарифа Pro для 10 специалистов" : "Усе з тарифу Pro для команди до 10 осіб", included: true, highlight: true },
                    { text: locale === 'en' ? "Team Lead dashboard & progress analytics" : locale === 'ru' ? "Панель тимлида и аналитика команды" : "Панель тімліда з аналітикою команди", included: true, highlight: true },
                    { text: locale === 'en' ? "Custom tasks tailored to company stack" : locale === 'ru' ? "Кастомные задачи под стек компании" : "Кастомні задачі під стек компанії", included: true },
                    { text: locale === 'en' ? "Priority code review SLA (under 12 hours)" : locale === 'ru' ? "Приоритетное ревью ментора (до 12ч)" : "Пріоритетне рев'ю ментора (до 12 год)", included: true },
                    { text: locale === 'en' ? "Corporate invoicing & official contract" : locale === 'ru' ? "Оплата по безналичному расчету" : "Оплата за безготівковим розрахунком", included: true },
                    { text: locale === 'en' ? "Dedicated mentor & private Slack/TG channel" : locale === 'ru' ? "Выделенный ментор и закрытый канал" : "Виділений ментор та закритий канал зв'язку", included: true },
                ]
            default:
                return []
        }
    }

    const formatPrice = (product: ProductItem) => {
        if (product.price === 0) return { val: t("free"), period: t("freeForever") }
        const priceNum = (product.price / 100).toLocaleString()
        const currencySign = product.currency === "UAH" ? "₴" : product.currency === "USD" ? "$" : product.currency

        if (product.id === 2) {
            return { val: `${priceNum} ${currencySign}`, period: t("oneTime") }
        }
        if (product.id === 3) {
            return { val: `${priceNum} ${currencySign}`, period: t("perMonth") }
        }
        if (product.id === 4) {
            return { val: `${priceNum} ${currencySign}`, period: t("perMonthTeam") }
        }
        return { val: `${priceNum} ${currencySign}`, period: product.type === "subscription" ? t("perMonth") : "" }
    }

    const getProductBadge = (product: ProductItem) => {
        if (product.id === 1) return t("demoBadge")
        if (product.id === 2) return t("baseBadge")
        if (product.id === 3) return t("proBadge")
        if (product.id === 4) return t("b2bBadge")
        return null
    }

    const getProductIcon = (product: ProductItem) => {
        if (product.id === 1) return <Terminal className="w-5 h-5 text-blue-400" />
        if (product.id === 2) return <Shield className="w-5 h-5 text-indigo-400" />
        if (product.id === 3) return <Crown className="w-5 h-5 text-amber-400" />
        if (product.id === 4) return <Users className="w-5 h-5 text-purple-400" />
        return <Zap className="w-5 h-5 text-blue-400" />
    }

    // Comparison rows
    const comparisonMatrix = [
        {
            category: t("categoryCurriculum"),
            items: [
                {
                    name: locale === 'en' ? "Accessible Levels" : locale === 'ru' ? "Доступные уровни" : "Доступні рівні",
                    demo: "Level 0",
                    base: "Level 0–3",
                    pro: locale === 'en' ? "All 10 Levels" : locale === 'ru' ? "Все 10 уровней" : "Усі 10 рівнів",
                    b2b: locale === 'en' ? "All 10 Levels" : locale === 'ru' ? "Все 10 уровней" : "Усі 10 рівнів",
                },
                {
                    name: locale === 'en' ? "Interactive in-browser editor" : locale === 'ru' ? "Интерактивный редактор в браузере" : "Інтерактивний редактор у браузері",
                    demo: true, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Number of coding lessons" : locale === 'ru' ? "Количество практических уроков" : "Кількість практичних уроків",
                    demo: "15", base: "60+", pro: "150+", b2b: "150+"
                },
                {
                    name: locale === 'en' ? "Stacks: TypeScript, Python, C#" : locale === 'ru' ? "Стеки: TypeScript, Python, C#" : "Стеки: TypeScript, Python, C#",
                    demo: true, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Page Object Model (POM)" : locale === 'ru' ? "Page Object Model (POM)" : "Page Object Model (POM)",
                    demo: false, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "CI/CD & Advanced Auth Sessions" : locale === 'ru' ? "CI/CD и продвинутая авторизация" : "CI/CD та просунуті Auth-сесії",
                    demo: false, base: false, pro: true, b2b: true
                }
            ]
        },
        {
            category: t("categoryProjects"),
            items: [
                {
                    name: locale === 'en' ? "Real Jira Projects & Boards" : locale === 'ru' ? "Реальные проекты в Jira" : "Реальні проєкти в Jira",
                    demo: false, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Agile Sprints & Test Runs" : locale === 'ru' ? "Agile спринты и тест-раны" : "Agile спринти та тест-рани",
                    demo: false, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Bug reporting & defect tracking" : locale === 'ru' ? "Отслеживание баг-репортов" : "Емуляція дефектів та баг-репорти",
                    demo: false, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Custom company projects" : locale === 'ru' ? "Кастомные проекты под заказ" : "Кастомні проєкти під компанію",
                    demo: false, base: false, pro: false, b2b: true
                }
            ]
        },
        {
            category: t("categoryMentorship"),
            items: [
                {
                    name: locale === 'en' ? "Automated test validation" : locale === 'ru' ? "Автоматическая валидация тестов" : "Автоматична валідація коду",
                    demo: true, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Instant AI Code Review (24/7)" : locale === 'ru' ? "ШИ-проверка кода 24/7" : "ШІ-перевірка коду (AI Code Review)",
                    demo: false, base: true, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Human Senior Mentor code review" : locale === 'ru' ? "Ручная проверка Senior ментором" : "Ручна перевірка Senior ментором",
                    demo: false, base: false, pro: true, b2b: locale === 'en' ? "Priority (<12h)" : locale === 'ru' ? "Приоритет (<12ч)" : "Пріоритет (<12 год)"
                },
                {
                    name: locale === 'en' ? "Instant Telegram review alerts" : locale === 'ru' ? "Уведомления в Telegram" : "Сповіщення в Telegram про перевірку",
                    demo: false, base: false, pro: true, b2b: true
                }
            ]
        },
        {
            category: t("categoryCareer"),
            items: [
                {
                    name: locale === 'en' ? "AI Mock Interview Simulator" : locale === 'ru' ? "Симулятор собеседований (AI)" : "Симулятор співбесід (AI Mock Interview)",
                    demo: false, base: false, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Timed Live Coding Challenges" : locale === 'ru' ? "Live-кодинг на время" : "Лайв-кодинг на час",
                    demo: false, base: false, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Official Graduate Certificate" : locale === 'ru' ? "Именной сертификат с верификацией" : "Іменний верифікований сертифікат",
                    demo: false, base: false, pro: true, b2b: true
                },
                {
                    name: locale === 'en' ? "Team Lead Management Analytics" : locale === 'ru' ? "Аналитика прогресса для тимлида" : "Аналітика для тімліда",
                    demo: false, base: false, pro: false, b2b: true
                }
            ]
        }
    ]

    // FAQ items
    const faqs = [
        {
            q: locale === 'en' ? "Which plan is best if I'm a complete beginner?" :
               locale === 'ru' ? "Какой тариф выбрать, если я полный новичок в автоматизации?" :
               "Який тариф обрати, якщо я повний новачок в автоматизації?",
            a: locale === 'en' ? "We recommend starting with Demo to test the browser environment. For real career readiness, choose the Pro subscription: it includes mentor code review and the interview simulator, giving you expert guidance from day one." :
               locale === 'ru' ? "Рекомендуем начать с Demo для знакомства. Для реальной подготовки к работе выбирайте подписку Pro: она включает ручную проверку кода опытным ментором и симулятор собеседований." :
               "Рекомендуємо почати з Demo, щоб відчути вбудований редактор. Якщо ж ваша мета — працевлаштування або впевнений перехід у QA Automation, обирайте підписку Pro: у неї входить перевірка коду діючим Senior ментором та симулятор технічних співбесід."
        },
        {
            q: locale === 'en' ? "How does Senior Mentor code review work?" :
               locale === 'ru' ? "Как работает проверка кода ментором?" :
               "Як відбувається перевірка коду ментором?",
            a: locale === 'en' ? "Once you finish a task and test it in the runner, click 'Submit to Mentor'. A real practicing Senior QA inspects your code architecture, highlights bad practices, and sends detailed comments. You receive instant notifications in Telegram and your cabinet." :
               locale === 'ru' ? "После выполнения задания вы нажимаете 'Отправить ментору'. Действующий Senior QA анализирует чистоту кода, использование селекторов и паттернов, оставляя подробные комментарии прямо в вашем кабинете и Telegram." :
               "Після написання автотесту ви натискаєте «Відправити ментору». Практикуючий Senior Automation QA розбирає вашу архітектуру, ефективність локаторів та структуру тестів, залишаючи детальні коментарі. Сповіщення миттєво надходить у Telegram та ваш кабінет."
        },
        {
            q: locale === 'en' ? "Can I cancel my Pro subscription at any time?" :
               locale === 'ru' ? "Могу ли я отменить подписку Pro в любой момент?" :
               "Чи можу я скасувати підписку Pro в будь-який момент?",
            a: locale === 'en' ? "Yes, absolutely! There are no hidden fees or lock-ins. You can cancel your recurring subscription with one click directly in your cabinet anytime, and you retain access until the end of your prepaid period." :
               locale === 'ru' ? "Да, конечно! Никаких скрытых условий. Вы можете отменить подписку в один клик в своем личном кабинете в любое время, доступ сохранится до конца оплаченного периода." :
               "Так, на 100%! Жодних прихованих умов чи штрафів. Ви можете скасувати підписку в 1 клік прямо в особистому кабінеті в будь-який момент. Доступ до всіх можливостей залишиться до кінця вже оплаченого місяця."
        },
        {
            q: locale === 'en' ? "What is the AI Mock Interview simulator?" :
               locale === 'ru' ? "Что такое симулятор собеседований с AI?" :
               "Що таке симулятор співбесід з AI?",
            a: locale === 'en' ? "It is an interactive technical interview trainer. An AI interviewer asks real-world Playwright, TypeScript, architecture, and framework questions tailored to your level, tests your live coding skills under pressure, and provides a readiness score." :
               locale === 'ru' ? "Это интерактивный симулятор технического интервью. AI-интервьюер задает реальные вопросы по Playwright, тестирует архитектурные подходы и оценивает live-кодинг с подробным разбором ошибок." :
               "Це повноцінний тренажер технічного інтерв'ю. ШІ-інтерв'юер проводить співбесіду за реальними питаннями IT-компаній (теорія Playwright, POM, фреймворки, асинхронність), дає задачу на лайв-кодинг і формує детальний звіт готовності до оферу."
        },
        {
            q: locale === 'en' ? "Do I get an official certificate upon completion?" :
               locale === 'ru' ? "Выдается ли официальный сертификат?" :
               "Чи видається офіційний сертифікат після проходження?",
            a: locale === 'en' ? "Yes! On the Pro plan, students who complete milestones receive verified digital certificates with a unique ID and QR code, perfect for adding to LinkedIn and sending to recruiters." :
               locale === 'ru' ? "Да! Студенты тарифа Pro после успешной сдачи задач получают именной верифицированный сертификат с уникальным ID и ссылкой для добавления в LinkedIn." :
               "Так! У тарифі Pro після виконання обов'язкових завдань та перевірки ментором ви отримуєте іменний цифровий сертифікат з унікальним ID та QR-кодом, який легко прикріпити до LinkedIn та резюме."
        },
        {
            q: locale === 'en' ? "Can companies pay via bank invoice (B2B)?" :
               locale === 'ru' ? "Можно ли оплатить по безналичному расчету (B2B)?" :
               "Чи можна оплатити за безготівковим розрахунком (B2B)?",
            a: locale === 'en' ? "Yes, we issue corporate invoices with full documentation for legal entities and private entrepreneurs. Contact our team in Telegram to set up a team license." :
               locale === 'ru' ? "Да, мы работаем с юридическими лицами и ФЛП по безналичному расчету с предоставлением всех закрывающих документов. Напишите нам в Telegram для оформления." :
               "Так, ми надаємо повний пакет документів для юридичних осіб та ФОП (рахунок-фактура, договір, акт виконаних робіт). Напишіть нам у Telegram для виставлення інвойсу на команду."
        }
    ]

    return (
        <div className="min-h-screen bg-background font-sans relative flex flex-col pb-24 overflow-x-hidden">
            {/* Ambient Mesh Gradient Glow */}
            <div className="mesh-gradient-container">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            {/* Top Container */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
                
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs sm:text-sm font-black uppercase tracking-wider mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                        {t("heroBadge")}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-5">
                        {locale === 'en' ? (
                            <>Master Playwright with <span className="text-gradient-premium">Real Code</span></>
                        ) : locale === 'ru' ? (
                            <>Тарифы обучения <span className="text-gradient-premium">Playwright</span></>
                        ) : (
                            <>Прозорі тарифи навчання <span className="text-gradient-premium">Playwright</span></>
                        )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
                        {t("choosePlanSubtitle")}
                    </p>

                    {/* Multi-stack badges: Playwright on TypeScript, Python, C# */}
                    <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-1">
                            {t("supportedLanguages")}
                        </span>
                        <button
                            onClick={() => setSelectedStack("ts")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedStack === "ts"
                                    ? "bg-blue-600/15 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10"
                                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            TypeScript (Core)
                        </button>
                        <button
                            onClick={() => setSelectedStack("py")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedStack === "py"
                                    ? "bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10"
                                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Python (pytest)
                        </button>
                        <button
                            onClick={() => setSelectedStack("cs")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedStack === "cs"
                                    ? "bg-purple-500/15 border-purple-500 text-purple-400 shadow-md shadow-purple-500/10"
                                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            C# (.NET)
                        </button>
                    </div>

                    {/* Category Tabs: All, Individual, Team */}
                    <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-secondary/40 border border-border backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === "all"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("allPlans")}
                        </button>
                        <button
                            onClick={() => setActiveTab("individual")}
                            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === "individual"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("individualPlans")}
                        </button>
                        <button
                            onClick={() => setActiveTab("team")}
                            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === "team"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("teamPlans")}
                        </button>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className={`grid gap-6 sm:gap-8 mb-20 ${
                    filteredProducts.length === 4
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                        : filteredProducts.length === 3
                            ? "grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto"
                            : "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                }`}>
                    {filteredProducts.map((product) => {
                        const isPro = product.id === 3
                        const isB2B = product.id === 4
                        const isDemo = product.id === 1
                        const isCurrentPlan = currentRoleId === product.grantedRoleId
                        const { val, period } = formatPrice(product)
                        const features = getPlanFeatures(product.id)
                        const badgeText = getProductBadge(product)

                        return (
                            <div
                                key={product.id}
                                className={`relative rounded-[2.2rem] p-6 sm:p-7 flex flex-col h-full transition-all duration-300 ${
                                    isPro
                                        ? "glass-card-premium border-2 border-blue-500/60 shadow-2xl shadow-blue-500/15 scale-[1.02] z-20"
                                        : isB2B
                                            ? "glass-card-premium border border-purple-500/30 hover:border-purple-500/60 shadow-xl"
                                            : "glass-card-premium border border-border/80 hover:border-blue-500/30 shadow-lg"
                                }`}
                            >
                                {/* Top Floating Badge */}
                                {isCurrentPlan ? (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <span className="bg-emerald-500 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {t("currentPlan")}
                                        </span>
                                    </div>
                                ) : isPro ? (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center gap-1.5">
                                            <Flame className="w-3.5 h-3.5 fill-current" /> {t("popular")}
                                        </span>
                                    </div>
                                ) : badgeText ? (
                                    <div className="absolute -top-3 left-6">
                                        <span className="bg-secondary text-muted-foreground border border-border text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            {badgeText}
                                        </span>
                                    </div>
                                ) : null}

                                {/* Header with Icon and Title */}
                                <div className="flex items-center justify-between mb-4 mt-2">
                                    <div className="space-y-1">
                                        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                            {product.id === 1 ? t("demoTitle") :
                                             product.id === 2 ? t("baseTitle") :
                                             product.id === 3 ? t("proTitle") :
                                             product.id === 4 ? t("b2bTitle") : product.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed min-h-[34px]">
                                            {product.id === 1 ? t("demoDesc") :
                                             product.id === 2 ? t("baseDesc") :
                                             product.id === 3 ? t("proDesc") :
                                             product.id === 4 ? t("b2bDesc") : product.description}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-2xl flex-shrink-0 ml-3 ${
                                        isPro ? "bg-blue-500/15 border border-blue-500/30" : "bg-secondary/60 border border-border"
                                    }`}>
                                        {getProductIcon(product)}
                                    </div>
                                </div>

                                {/* Price block */}
                                <div className="py-4 my-2 border-y border-border/50">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                                            isPro ? "text-foreground" : "text-foreground"
                                        }`}>
                                            {val}
                                        </span>
                                    </div>
                                    {period && (
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mt-1">
                                            {period}
                                        </span>
                                    )}
                                </div>

                                {/* Features List */}
                                <div className="flex-1 py-4 space-y-2.5">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                                        {locale === 'en' ? "What's included:" : locale === 'ru' ? "Что входит:" : "Що входить:"}
                                    </p>
                                    {features.map((feat, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                                            {feat.included ? (
                                                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    feat.highlight
                                                        ? "bg-blue-500 text-white shadow-sm shadow-blue-500/40"
                                                        : "bg-emerald-500/15 text-emerald-500"
                                                }`}>
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                            ) : (
                                                <div className="mt-0.5 w-4 h-4 rounded-full bg-muted/40 text-muted-foreground/40 flex items-center justify-center flex-shrink-0">
                                                    <X className="w-2.5 h-2.5 stroke-[2]" />
                                                </div>
                                            )}
                                            <span className={`leading-snug ${
                                                feat.included
                                                    ? feat.highlight
                                                        ? "font-bold text-foreground"
                                                        : "font-medium text-foreground/90"
                                                    : "text-muted-foreground/40 line-through"
                                            }`}>
                                                {feat.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Action Button */}
                                <div className="pt-4 mt-auto">
                                    {isCurrentPlan ? (
                                        <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                            <Check className="w-4 h-4" /> {t("active")}
                                        </div>
                                    ) : isDemo ? (
                                        <Link
                                            href={isAuthenticated ? "/dashboard" : "/register"}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-secondary/80 hover:bg-secondary text-foreground border border-border transition-all"
                                        >
                                            {isAuthenticated ? (locale === 'en' ? "Open Dashboard" : locale === 'ru' ? "Открыть дашборд" : "Перейти до дашборду") : t("startFreeBtn")}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/checkout?productId=${product.id}`}
                                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
                                                isPro
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
                                                    : isB2B
                                                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]"
                                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]"
                                            }`}
                                        >
                                            {currentRoleId && currentRoleId > 1 ? t("upgradePlanBtn") : t("choosePlanBtn")}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Trust & Guarantee Triad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    <div className="p-6 rounded-3xl glass-card-premium border border-border/60 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-foreground mb-1">{t("trustInstant")}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t("trustInstantDesc")}</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl glass-card-premium border border-border/60 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-foreground mb-1">{t("trustCancel")}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t("trustCancelDesc")}</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl glass-card-premium border border-border/60 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                            <Laptop className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-foreground mb-1">{t("trustPractice")}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t("trustPracticeDesc")}</p>
                        </div>
                    </div>
                </div>

                {/* Technology Stacks Showcase */}
                <div className="mb-24 rounded-[2.5rem] glass-card-premium border border-border/80 p-8 sm:p-12 relative overflow-hidden">
                    <div className="max-w-2xl mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-wider mb-3">
                            <Code2 className="w-4 h-4" /> Multi-Language Playwright
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            {locale === 'en' ? "One Framework — Three Industry Stacks" :
                             locale === 'ru' ? "Один фреймворк — три востребованных стека" :
                             "Один фреймворк — три затребуваних стеки"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {locale === 'en' ? "Playwright is not limited to a single language. We prepare you to write enterprise-grade automation in the language your project needs." :
                             locale === 'ru' ? "Playwright универсален. Мы учим писать надежные тесты на том языке, который требует ваш проект или работодатель." :
                             "Playwright універсальний. На нашій платформі ви тренуєтеся писати стабільні тести на тій мові, яку вимагає ваш поточний проєкт чи роботодавець."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* TypeScript */}
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-border hover:border-blue-500/40 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-base mb-4">
                                TS
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">TypeScript & JavaScript</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                {locale === 'en' ? "The primary native runtime for Playwright. 80%+ of market vacancies. Strong typing, fixtures, and ultra-fast async execution." :
                                 locale === 'ru' ? "Основная нативная среда Playwright. Более 80% вакансий. Строгая типизация, фикстуры и удобный async/await." :
                                 "Основне нативне середовище для Playwright. Понад 80% вакансій на ринку. Сувора типізація, фікстури та блискавичний async/await."}
                            </p>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">Playwright Test Runner</span>
                        </div>

                        {/* Python */}
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-border hover:border-amber-500/40 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-base mb-4">
                                PY
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Python (pytest)</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                {locale === 'en' ? "Clean syntax with pytest-playwright. Dominant in data science, backend QA, and rapid end-to-end regression suites." :
                                 locale === 'ru' ? "Лаконичный синтаксис с плагином pytest-playwright. Идеально для backend QA, работы с данными и быстрых регрессионных тестов." :
                                 "Лаконічний синтаксис з плагіном pytest-playwright. Ідеально для backend QA, роботи з базами даних та швидких регресійних тестів."}
                            </p>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">pytest-playwright</span>
                        </div>

                        {/* C# .NET */}
                        <div className="p-6 rounded-3xl bg-secondary/30 border border-border hover:border-purple-500/40 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-base mb-4">
                                C#
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">C# (.NET)</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                {locale === 'en' ? "Enterprise powerhouse for Microsoft ecosystems. Full support for NUnit, xUnit, and MSTest with PageTest base fixtures." :
                                 locale === 'ru' ? "Корпоративный стандарт для экосистем Microsoft. Полная поддержка NUnit, xUnit и базовых PageTest фикстур." :
                                 "Корпоративний стандарт для enterprise екосистем Microsoft. Повна підтримка NUnit, xUnit та базових PageTest фікстур."}
                            </p>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-wider">Microsoft.Playwright.NUnit</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Comparison Table */}
                <div className="mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
                            {t("compareTitle")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t("compareSubtitle")}
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-border/80 glass-card-premium shadow-2xl">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="p-5 font-bold text-foreground w-[36%]">
                                        {locale === 'en' ? "Features & Privileges" : locale === 'ru' ? "Возможности и функции" : "Можливості та функції"}
                                    </th>
                                    <th className="p-5 font-bold text-center text-muted-foreground w-[16%]">Demo</th>
                                    <th className="p-5 font-bold text-center text-muted-foreground w-[16%]">Base</th>
                                    <th className="p-5 font-black text-center text-blue-500 dark:text-blue-400 w-[16%] bg-blue-500/5">
                                        Pro 🔥
                                    </th>
                                    <th className="p-5 font-bold text-center text-purple-400 w-[16%]">B2B Team</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {comparisonMatrix.map((section, sIdx) => (
                                    <>
                                        <tr key={`sec-${sIdx}`} className="bg-secondary/40">
                                            <td colSpan={5} className="py-3 px-5 font-black text-xs uppercase tracking-widest text-primary">
                                                {section.category}
                                            </td>
                                        </tr>
                                        {section.items.map((row, rIdx) => (
                                            <tr key={`row-${sIdx}-${rIdx}`} className="hover:bg-muted/20 transition-colors">
                                                <td className="p-4 sm:p-5 font-semibold text-foreground">
                                                    {row.name}
                                                </td>
                                                {["demo", "base", "pro", "b2b"].map((colKey) => {
                                                    const val = (row as any)[colKey]
                                                    const isProCol = colKey === "pro"
                                                    return (
                                                        <td
                                                            key={colKey}
                                                            className={`p-4 sm:p-5 text-center ${
                                                                isProCol ? "bg-blue-500/5 font-bold" : ""
                                                            }`}
                                                        >
                                                            {typeof val === "boolean" ? (
                                                                val ? (
                                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-muted/40 text-muted-foreground/40 flex items-center justify-center mx-auto">
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className={isProCol ? "text-blue-500 dark:text-blue-400 font-black" : "text-foreground font-semibold"}>
                                                                    {val}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-24">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">
                            <HelpCircle className="w-3.5 h-3.5" /> FAQ
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">
                            {t("faqTitle")}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {t("faqSubtitle")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-border/80 glass-card-premium overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 sm:p-6 text-left group"
                                    >
                                        <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-blue-500 transition-colors pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                                            isOpen ? "rotate-180 text-blue-500" : ""
                                        }`} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 mt-1">
                                            <div className="pt-3">{faq.a}</div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom Call To Action Banner */}
                <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-950/40 border border-blue-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {t("ctaTitle")}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                            {t("ctaSubtitle")}
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://t.me/playwrightfortestbot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all"
                            >
                                <Send className="w-4 h-4" />
                                {t("ctaTelegramBtn")}
                            </a>
                            <Link
                                href={isAuthenticated ? "/dashboard" : "/register"}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
                            >
                                {t("ctaTryDemoBtn")}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Footer Links */}
                <div className="mt-12 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {isAuthenticated ? (
                        <Link href="/cabinet" className="hover:text-foreground transition-colors">
                            {t("myCabinet")}
                        </Link>
                    ) : (
                        <Link href="/login" className="hover:text-foreground transition-colors">
                            {t("login")}
                        </Link>
                    )}
                    <Link href="/" className="hover:text-foreground transition-colors">
                        {t("home")}
                    </Link>
                </div>
            </div>
        </div>
    )
}
