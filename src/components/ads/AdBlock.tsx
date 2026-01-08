"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

interface AdBlock {
    id: number
    title: string
    type: "banner" | "text" | "cta"
    placement: "global" | "task"
    content: string | null
    imageUrl: string | null
    linkUrl: string | null
    buttonText: string | null
    order: number
}

interface AdBlockProps {
    placement: "global" | "task"
    position?: "before" | "after"
}

export default function AdBlock({ placement, position = "before" }: AdBlockProps) {
    const [blocks, setBlocks] = useState<AdBlock[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadBlocks()
    }, [placement])

    const loadBlocks = async () => {
        try {
            const res = await fetch(`/api/public/marketing?placement=${placement}`)
            if (res.ok) {
                const data = await res.json()
                setBlocks(data)
            }
        } catch (error) {
            console.error("Error loading ad blocks:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || blocks.length === 0) {
        return null
    }

    return (
        <div className="space-y-4 my-6">
            {blocks.map((block) => (
                <div key={block.id} className="ad-block">
                    {block.type === "banner" && block.imageUrl && (
                        <a
                            href={block.linkUrl || "#"}
                            target={block.linkUrl?.startsWith("http") ? "_blank" : undefined}
                            rel={block.linkUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <img
                                src={block.imageUrl}
                                alt={block.title}
                                className="w-full h-auto object-cover"
                            />
                        </a>
                    )}

                    {block.type === "text" && block.content && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {block.type === "cta" && (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white shadow-lg">
                            {block.content && (
                                <div className="prose prose-sm prose-invert max-w-none mb-4">
                                    <ReactMarkdown>{block.content}</ReactMarkdown>
                                </div>
                            )}
                            {block.linkUrl && block.buttonText && (
                                <a
                                    href={block.linkUrl}
                                    target={block.linkUrl.startsWith("http") ? "_blank" : undefined}
                                    rel={block.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className="inline-block px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                                >
                                    {block.buttonText}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
