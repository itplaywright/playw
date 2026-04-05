import Link from "next/link"
import { Github, Twitter, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-secondary/30 border-t border-border py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-foreground tracking-tight">Playwright Platform</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        Професійна платформа для вивчення автоматизації тестування на базі сучасного стеку технологій.
                    </p>
                </div>

                {/* Navigation Column */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Платформа</h4>
                    <ul className="space-y-4">
                        <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Курси та завдання</Link></li>
                        <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Тарифи</Link></li>
                        <li><Link href="/activate" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Активація коду</Link></li>
                        <li><Link href="/checkout?productId=2" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Купити курс</Link></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Підтримка</h4>
                    <ul className="space-y-4">
                        <li>
                            <Link href="https://t.me/playwrightfortestbot" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Telegram Бот
                            </Link>
                        </li>
                        <li className="text-muted-foreground text-sm">docs@itplatform.com</li>
                        <li className="text-muted-foreground text-sm">Графік: Пн-Пт 10:00 - 19:00</li>
                    </ul>
                </div>

                {/* Community & Socials */}
                <div>
                    <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Спільнота</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://t.me/playwrightfortestbot" target="_blank" className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 hover:text-blue-500 dark:hover:text-blue-300 transition-all border border-blue-500/20">
                            <MessageSquare className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border flex flex-col md:row items-center justify-between gap-4">
                <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    &copy; {currentYear} IT PLATFORM. ВСІ ПРАВА ЗАХИЩЕНІ.
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
