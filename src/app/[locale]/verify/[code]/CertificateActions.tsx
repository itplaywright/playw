"use client"

import { useState } from "react"
import { Share2, Printer, Check, Copy, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Props {
    certNumber: string
    linkedInUrl: string
}

export function CertificateActions({ certNumber, linkedInUrl }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        }
    }

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print()
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                {/* LinkedIn Add Button */}
                <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-md shadow-[#0A66C2]/20"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Додати в LinkedIn</span>
                </a>

                {/* Print / Save PDF */}
                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10"
                >
                    <Printer className="w-4 h-4" />
                    <span>Друк / Зберегти PDF</span>
                </button>

                {/* Copy Link */}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Скопійовано!" : "Скопіювати лінк"}</span>
                </button>
            </div>

            {/* Inbound Lead generation for viewers / recruiters */}
            <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
                <span>Пройти сертифікацію самостійно</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    )
}
