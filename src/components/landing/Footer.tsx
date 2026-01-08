"use client"

import Link from "next/link"

export default function Footer() {
    return (
        <footer className="py-16 bg-background border-t border-border">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎭</span>
                        <span className="text-xl font-extrabold text-foreground tracking-tight">Playwright Platform</span>
                    </div>

                    <nav className="flex items-center gap-10">
                        <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">Як це працює</Link>
                        <Link href="#program" className="text-muted-foreground hover:text-primary transition-colors font-medium">Програма</Link>
                        <Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">FAQ</Link>
                    </nav>

                    <div className="text-muted-foreground text-sm font-medium">
                        © {new Date().getFullYear()} Усі права захищені.
                    </div>
                </div>
            </div>
        </footer>
    )
}
