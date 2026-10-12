"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Download, Code2, ArrowLeft, CheckCircle2, ChevronRight, Boxes, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { completeOnboarding } from "./actions"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function SetupPage() {
    const t = useTranslations('Onboarding')
    const [activeStep, setActiveStep] = useState(1) // Step 1 is Node/Python/.NET now, since Step 0 is Language Choice
    const [programmingLanguage, setProgrammingLanguage] = useState<string | null>(null)
    const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false)

    // Language selection view
    if (!hasSelectedLanguage) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-indigo-900/20 to-transparent blur-[120px]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mb-6">
                            <Code2 className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('langTitle')}</h1>
                        <p className="text-slate-400 text-lg">{t('langContent')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        {[
                            { 
                                id: "typescript", 
                                name: "TypeScript", 
                                border: "border-blue-500", 
                                bg: "bg-blue-500/10",
                                shadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                                text: "text-blue-400",
                                dotBg: "bg-blue-400",
                                dotBorder: "border-blue-400"
                            },
                            { 
                                id: "python", 
                                name: "Python", 
                                border: "border-yellow-500", 
                                bg: "bg-yellow-500/10",
                                shadow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
                                text: "text-yellow-400",
                                dotBg: "bg-yellow-400",
                                dotBorder: "border-yellow-400"
                            },
                            { 
                                id: "csharp", 
                                name: "C#", 
                                border: "border-purple-500", 
                                bg: "bg-purple-500/10",
                                shadow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                                text: "text-purple-400",
                                dotBg: "bg-purple-400",
                                dotBorder: "border-purple-400"
                            }
                        ].map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setProgrammingLanguage(lang.id)}
                                className={`p-6 rounded-2xl border-2 text-center transition-all ${
                                    programmingLanguage === lang.id
                                        ? `${lang.border} ${lang.bg} ${lang.shadow} scale-105`
                                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                                }`}
                            >
                                <h3 className={`text-xl font-bold ${programmingLanguage === lang.id ? lang.text : "text-slate-300"}`}>
                                    {lang.name}
                                </h3>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setHasSelectedLanguage(true)}
                        disabled={!programmingLanguage}
                        className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                        Продовжити <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        )
    }

    // Dynamic steps based on language
    const getEnvironmentStep = () => {
        if (programmingLanguage === "python") {
            return {
                id: 1,
                title: "Python",
                icon: <Boxes className="w-6 h-6" />,
                description: t('pyDesc'),
                content: (
                    <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            {t.rich('pyContent', { strong: (chunks) => <strong>{chunks}</strong> })}
                        </p>
                        <a
                            href="https://www.python.org/downloads/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            {t('pyBtn')}
                        </a>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                            <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-slate-500" />
                                {t('nodeCheck')}
                            </h4>
                            <code className="text-yellow-400 font-mono">python --version</code>
                        </div>
                    </div>
                )
            }
        } else if (programmingLanguage === "csharp") {
            return {
                id: 1,
                title: ".NET SDK",
                icon: <Boxes className="w-6 h-6" />,
                description: t('csDesc'),
                content: (
                    <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            {t('csContent')}
                        </p>
                        <a
                            href="https://dotnet.microsoft.com/download"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            {t('csBtn')}
                        </a>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-slate-500" />
                                {t('nodeCheck')}
                            </h4>
                            <code className="text-purple-400 font-mono">dotnet --version</code>
                        </div>
                    </div>
                )
            }
        }
        
        // Default: TypeScript/Node.js
        return {
            id: 1,
            title: "Node.js",
            icon: <Boxes className="w-6 h-6" />,
            description: t('nodeDesc'),
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        {t.rich('nodeContent1', { strong: (chunks) => <strong>{chunks}</strong> })}
                    </p>
                    <a
                        href="https://nodejs.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        {t('nodeBtn')}
                    </a>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-500" />
                            {t('nodeCheck')}
                        </h4>
                        <code className="text-green-400 font-mono">node -v</code>
                        <p className="text-slate-500 text-sm mt-2">{t('nodeCheckDesc')}</p>
                    </div>
                </div>
            )
        }
    }

    const getPlaywrightStep = () => {
        if (programmingLanguage === "python") {
            return {
                id: 4,
                title: "Playwright",
                icon: <Sparkles className="w-6 h-6" />,
                description: t('pwDesc'),
                content: (
                    <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            {t('pwPyDesc')}
                        </p>
                        <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2 text-xs text-slate-500 font-mono">bash</span>
                            </div>
                            <div className="p-6">
                                <div className="font-mono text-sm leading-8">
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ pip install pytest-playwright</div>
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ playwright install</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        } else if (programmingLanguage === "csharp") {
            return {
                id: 4,
                title: "Playwright",
                icon: <Sparkles className="w-6 h-6" />,
                description: t('pwDesc'),
                content: (
                    <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            {t('pwCsDesc')}
                        </p>
                        <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2 text-xs text-slate-500 font-mono">bash</span>
                            </div>
                            <div className="p-6">
                                <div className="font-mono text-sm leading-8">
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ dotnet new nunit -n PlaywrightTests</div>
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ cd PlaywrightTests</div>
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ dotnet add package Microsoft.Playwright.NUnit</div>
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ dotnet build</div>
                                    <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ pwsh bin/Debug/net8.0/playwright.ps1 install</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
        
        return {
            id: 4,
            title: "Playwright",
            icon: <Sparkles className="w-6 h-6" />,
            description: t('pwDesc'),
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        {t('pwContent1')}
                    </p>
                    <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="ml-2 text-xs text-slate-500 font-mono">bash</span>
                        </div>
                        <div className="p-6">
                            <div className="font-mono text-sm leading-8">
                                <div className="text-slate-400"><span className="text-emerald-400">➜</span> ~ npm init playwright@latest</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-indigo-200 mt-6">
                        <p className="font-medium mb-3">{t('pwSettings')}</p>
                        <ul className="list-disc list-inside space-y-1 opacity-80 text-sm">
                            <li>{t.rich('pwOption1', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
                            <li>{t.rich('pwOption2', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
                            <li>{t.rich('pwOption3', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
                            <li>{t.rich('pwOption4', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
                        </ul>
                    </div>
                </div>
            )
        }
    }

    const steps = [
        getEnvironmentStep(),
        {
            id: 2,
            title: "VS Code",
            icon: <Code2 className="w-6 h-6" />,
            description: t('vsDesc'),
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        {t('vsContent1')}
                    </p>
                    <a
                        href="https://code.visualstudio.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        {t('vsBtn')}
                    </a>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <h4 className="text-slate-200 font-bold mb-3">{t('vsExt')}</h4>
                        <ul className="space-y-3 text-slate-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                <span><strong>Playwright Test for VSCode</strong>: {t('vsExt1')}</span>
                            </li>
                            {programmingLanguage === "python" && (
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>Python</strong>: {t('extPy')}</span>
                                </li>
                            )}
                            {programmingLanguage === "csharp" && (
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span><strong>C# Dev Kit</strong>: {t('extCs')}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: "Git",
            icon: <Terminal className="w-6 h-6" />,
            description: t('gitDesc'),
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        {t('gitContent1')}
                    </p>
                    <a
                        href="https://git-scm.com/downloads"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        {t('gitBtn')}
                    </a>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-slate-500" />
                            {t('nodeCheck')}
                        </h4>
                        <code className="text-orange-400 font-mono">git --version</code>
                    </div>
                </div>
            )
        },
        getPlaywrightStep()
    ]

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-indigo-900/20 to-transparent blur-[120px]" />

            <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
                <button 
                    onClick={() => setHasSelectedLanguage(false)} 
                    className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium mb-12 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('changeLanguage')}
                </button>

                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
                        <Terminal className="w-3 h-3" />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
                        {t('title1')} <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                            {t('title2')}
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Navigation Sidebar */}
                    <div className="md:w-1/3 shrink-0">
                        <div className="sticky top-24 space-y-2">
                            {steps.map((step) => (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(step.id)}
                                    className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between ${activeStep === step.id
                                        ? "bg-slate-900 border-l-4 border-indigo-500 text-foreground shadow-lg"
                                        : "hover:bg-muted/50 text-muted-foreground border-l-4 border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${activeStep === step.id ? "bg-indigo-500/20 text-indigo-400" : "bg-muted text-muted-foreground"}`}>
                                            {step.icon}
                                        </div>
                                        <span className="font-bold text-lg">{step.title}</span>
                                    </div>
                                    {activeStep === step.id && <ChevronRight className="w-5 h-5 text-indigo-500" />}
                                </button>
                            ))}

                            <div className="pt-8 mt-8 border-t border-border">
                                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm">
                                    <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4">{t('finishTitle')}</h4>
                                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                                        {t('finishDesc')}
                                    </p>
                                    <FinishButton programmingLanguage={programmingLanguage!} t={t} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:w-2/3">
                        <AnimatePresence mode="wait">
                            {steps.map((step) => (
                                activeStep === step.id && (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-background/50 backdrop-blur-md border border-border rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
                                        <div className="relative z-10">
                                            <h2 className="text-3xl font-extrabold mb-4">{step.title}</h2>
                                            <p className="text-xl text-indigo-400 mb-8 font-medium">
                                                {step.description}
                                            </p>
                                            {step.content}
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}

function FinishButton({ programmingLanguage, t }: { programmingLanguage: string, t: any }) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleFinish = async () => {
        setIsPending(true)
        try {
            await completeOnboarding(programmingLanguage)
            toast.success(t('success'))
            router.push("/dashboard")
        } catch (error) {
            toast.error(t('error'))
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleFinish}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 disabled:scale-100 disabled:opacity-70 group"
        >
            {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    {t('finishBtn')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
    )
}
