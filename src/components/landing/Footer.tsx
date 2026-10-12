"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export default function Footer() {
    const t = useTranslations('Footer')

    return (
        <footer className="py-16 bg-background border-t border-border">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎭</span>
                        <span className="text-xl font-extrabold text-foreground tracking-tight">Playwright Platform</span>
                    </div>

                    <nav className="flex items-center gap-10">
                        <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">{t('howItWorks')}</Link>
                        <Link href="#curriculum" className="text-muted-foreground hover:text-primary transition-colors font-medium">{t('program')}</Link>
                        <Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">FAQ</Link>
                        <Link href="/api/auth/signin" className="text-muted-foreground hover:text-primary transition-colors font-medium">{t('login')}</Link>
                        <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors font-medium">{t('register')}</Link>
                    </nav>

                    <div className="text-muted-foreground text-sm font-medium">
                        © {new Date().getFullYear()} {t('rights')}
                    </div>
                </div>
            </div>
        </footer>
    )
}
