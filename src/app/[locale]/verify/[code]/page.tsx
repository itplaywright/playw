import { db } from "@/db"
import { certificates, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { CERTIFICATE_TIERS } from "@/lib/certificates"
import { ShieldCheck, Award, Calendar, CheckCircle2, Share2, Printer, ExternalLink, Terminal, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { CertificateActions } from "./CertificateActions"

interface Props {
    params: Promise<{
        locale: string
        code: string
    }>
}

export const dynamic = "force-dynamic"

function getSampleCert(locale: string) {
    return {
        id: 9999,
        certificateNumber: "PW-2026-A1042",
        userId: "sample",
        tier: "associate" as const,
        studentName: locale === "en" ? "Alex Kovalenko (Sample)" : "Олександр Коваленко (Зразок)",
        skills: [
            "TypeScript for QA",
            "Playwright Locators & Selectors",
            "Test Structure & Hooks",
            "Web Assertions & Expectations",
            "Form Interactions & Actions",
            "Debugging & Trace Viewer"
        ],
        tasksCompleted: 25,
        linesOfCode: 850,
        issuedAt: new Date(),
    }
}


export async function generateMetadata({ params }: Props) {
    const { code, locale } = await params
    const isSample = code.toLowerCase() === "sample" || code.toLowerCase() === "demo"
    const cert = isSample ? getSampleCert(locale) : (await db.select().from(certificates).where(eq(certificates.certificateNumber, code)))[0]

    if (!cert) {
        return { title: "Certificate Not Found | IT Playwright" }
    }

    const tierDef = CERTIFICATE_TIERS.find(t => t.id === cert.tier)
    const title = tierDef ? tierDef.title : "Playwright Certificate"

    return {
        title: `${cert.studentName} — ${title} | IT Playwright Verification`,
        description: `Official verified certificate ${cert.certificateNumber} issued to ${cert.studentName} by IT Playwright Platform & Verified Senior Mentors.`,
    }
}

export default async function VerifyCertificatePage({ params }: Props) {
    const { code, locale } = await params
    const isSample = code.toLowerCase() === "sample" || code.toLowerCase() === "demo"
    const cert = isSample ? getSampleCert(locale) : (await db.select().from(certificates).where(eq(certificates.certificateNumber, code)))[0]

    if (!cert) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">Сертифікат не знайдено</h1>
                <p className="text-slate-400 text-sm max-w-md mb-8">
                    Сертифікат із номером <code className="text-amber-400 font-mono px-2 py-0.5 rounded bg-white/5">{code}</code> не існує в офіційному реєстрі платформи або був відкликаний.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/20"
                >
                    На головну
                </Link>
            </div>
        )
    }

    const tierDef = CERTIFICATE_TIERS.find(t => t.id === cert.tier) || CERTIFICATE_TIERS[0]
    const skills = (cert.skills as string[]) || tierDef.skills

    const issuedDateFormatted = new Date(cert.issuedAt).toLocaleDateString(
        locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
    )

    // LinkedIn Add to Profile URL
    const issueDate = new Date(cert.issuedAt)
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(tierDef.title)}&organizationName=${encodeURIComponent("IT Playwright Academy")}&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${encodeURIComponent(`https://itplatform-three.vercel.app/${locale}/verify/${cert.certificateNumber}`)}&certId=${encodeURIComponent(cert.certificateNumber)}`

    return (
        <div className="min-h-screen bg-[#020617] text-foreground p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative selection:bg-blue-500/30">
            {/* Background ambient lighting */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-purple-600/10 blur-[130px] rounded-full" />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-8 print:hidden">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs leading-none">Playwright Course</p>
                        <p className="text-[10px] text-slate-500 font-medium">Official Certificate Verification</p>
                    </div>
                </Link>

                {isSample ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-md shadow-amber-500/10">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Зразок сертифіката (Демо)</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Офіційно підтверджено</span>
                    </div>
                )}
            </div>

            {/* Certificate Canvas / Card */}
            <div className="relative z-10 w-full max-w-4xl rounded-3xl p-1 bg-gradient-to-br from-white/20 via-blue-500/20 to-purple-500/20 shadow-2xl shadow-blue-500/10 print:shadow-none print:border-none">
                <div className="relative bg-slate-950/95 backdrop-blur-xl rounded-[22px] p-8 sm:p-14 border border-white/10 overflow-hidden">
                    {/* Watermark Logo in BG */}
                    <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none select-none">
                        <Award className="w-96 h-96 text-white" />
                    </div>

                    {/* Top Seal & Organization Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
                                <Terminal className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tight">IT Playwright Academy</h3>
                                <p className="text-slate-400 text-xs font-semibold">Test Automation Engineering Standards</p>
                            </div>
                        </div>

                        <div className="text-center sm:text-right">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block mb-1">
                                CERTIFICATE ID
                            </span>
                            <span className="font-mono text-base font-bold text-white tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                                {cert.certificateNumber}
                            </span>
                        </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="text-center py-10 sm:py-14 space-y-6">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-slate-400">
                            CERTIFICATE OF EXCELLENCE & COMPLETION
                        </p>

                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-medium">Цим підтверджується, що</p>
                            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent py-1">
                                {cert.studentName}
                            </h1>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                            успішно пройшов(-ла) повну практичну програму підготовки з автоматизації тестування на Playwright, виконав(-ла) всі завдання курсу та отримав(-ла) схвалення старших менторів:
                        </p>

                        {/* Certificate Tier Badge */}
                        <div className="inline-block py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                            <span className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 justify-center">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                {tierDef.title}
                            </span>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-0.5 block">
                                {tierDef.badge} • {tierDef.levelRange}
                            </span>
                        </div>

                        {/* Verified Skills */}
                        <div className="pt-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                                ПІДТВЕРДЖЕНІ ПРАКТИЧНІ КОМПЕТЕНЦІЇ
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                                {skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-200"
                                    >
                                        ✓ {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metadata & Mentor Sign-off */}
                    <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center sm:text-left">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                                Дата видачі
                            </span>
                            <span className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                {issuedDateFormatted}
                            </span>
                        </div>

                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                                Перевірено робіт
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                                {cert.tasksCompleted} практичних завдань
                            </span>
                        </div>

                        <div className="text-center sm:text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                                Акредитація
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                                Senior QA Mentor Board
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions for Student / Recruiter (Hidden on Print) */}
            <div className="relative z-10 w-full max-w-4xl mt-6 print:hidden">
                <CertificateActions
                    certNumber={cert.certificateNumber}
                    linkedInUrl={linkedInUrl}
                />
            </div>
        </div>
    )
}
