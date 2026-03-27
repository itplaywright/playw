import Link from "next/link"
import { Github, Twitter, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 border-t border-white/5 py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">Playwright Platform</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Професійна платформа для вивчення автоматизації тестування на базі сучасного стеку технологій.
                    </p>
                </div>

                {/* Navigation Column */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Платформа</h4>
                    <ul className="space-y-4">
                        <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Курси та завдання</Link></li>
                        <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Тарифи</Link></li>
                        <li><Link href="/activate" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Активація коду</Link></li>
                        <li><Link href="/checkout?productId=2" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Купити курс</Link></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Підтримка</h4>
                    <ul className="space-y-4">
                        <li>
                            <Link href="https://t.me/playwrightfortestbot" target="_blank" className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Telegram Бот
                            </Link>
                        </li>
                        <li className="text-slate-400 text-sm">docs@itplatform.com</li>
                        <li className="text-slate-400 text-sm">Графік: Пн-Пт 10:00 - 19:00</li>
                    </ul>
                </div>

                {/* Community & Socials */}
                <div>
                    <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest opacity-50">Спільнота</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/10">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://t.me/playwrightfortestbot" target="_blank" className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all border border-blue-500/20">
                            <MessageSquare className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                    &copy; {currentYear} IT PLATFORM. ВСІ ПРАВА ЗАХИЩЕНІ.
                </div>
                <div className="flex gap-8 text-xs text-slate-500 uppercase tracking-widest font-bold">
                    <Link href="#" className="hover:text-slate-300 transition-colors">POLICIES</Link>
                    <Link href="#" className="hover:text-slate-300 transition-colors">TERMS</Link>
                    <Link href="#" className="hover:text-slate-300 transition-colors">PRIVACY</Link>
                </div>
            </div>
        </footer>
    )
}
