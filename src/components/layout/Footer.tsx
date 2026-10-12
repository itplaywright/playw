import Link from "next/link"
import { Github, Twitter, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react"
import { getTranslations, getLocale } from "next-intl/server"

export default async function Footer() {
    const t = await getTranslations('LayoutFooter')
    const locale = await getLocale()
    const currentYear = new Date().getFullYear()

    let config: any = {}
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/public/config`, { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            config = data.settings || {}
        }
    } catch (e) {
        console.error("Failed to fetch config for footer:", e)
    }

    const desc = config[`footer_desc_${locale}`] || t('desc')
    const platformName = config.header_platform_name || "Playwright Platform"
    
    const telegram = config.footer_telegram || "https://t.me/playwrightfortestbot"
    const email = config.footer_email || "docs@itplatform.com"
    const github = config.footer_github || ""
    const twitter = config.footer_twitter || ""

    return (
        <footer className="bg-secondary/30 border-t border-border py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-foreground tracking-tight">{platformName}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        {desc}
                    </p>
                </div>

                {/* Navigation Column */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">{t('platform')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t('courses')}</Link></li>
                        <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t('pricing')}</Link></li>
                        <li><Link href="/activate" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t('activateCode')}</Link></li>
                        <li><Link href="/checkout?productId=2" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t('buyCourse')}</Link></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">{t('support')}</h4>
                    <ul className="space-y-4">
                        {telegram && (
                            <li>
                                <a href={telegram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    {t('telegramBot')}
                                </a>
                            </li>
                        )}
                        {email && (
                            <li className="text-muted-foreground text-sm">
                                <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">{email}</a>
                            </li>
                        )}
                        <li className="text-muted-foreground text-sm">{t('schedule')}</li>
                    </ul>
                </div>

                {/* Community & Socials */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">{t('community')}</h4>
                    <div className="flex gap-4">
                        {github && (
                            <a href={github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border">
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {twitter && (
                            <a href={twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border">
                                <Twitter className="w-5 h-5" />
                            </a>
                        )}
                        {telegram && (
                            <a href={telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 hover:text-blue-500 dark:hover:text-blue-300 transition-all border border-blue-500/20">
                                <MessageSquare className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    &copy; {currentYear} IT PLATFORM. {t('rights')}
                </div>
                <div className="flex gap-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <Link href="#" className="hover:text-foreground transition-colors">POLICIES</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">TERMS</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">PRIVACY</Link>
                </div>
            </div>
        </footer>
    )
}
