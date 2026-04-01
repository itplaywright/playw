"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import CodeEditor from "@/components/editor/Monaco"
import { CheckCircle2, Clock, User, BookOpen, Send, ChevronRight, Search } from "lucide-react"

interface Submission {
    id: number
    code: string
    status: "pending" | "reviewed" | "rejected"
    mentorFeedback: string | null
    createdAt: string | Date
    userName: string
    userEmail: string
    taskTitle: string
    taskId: number
}

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [feedback, setFeedback] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/submissions")
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to load")
            }
            const data = await res.json()
            setSubmissions(Array.isArray(data) ? data : [])
        } catch (error: any) {
            console.error("Submissions load error:", error)
            toast.error(error.message || "Failed to load submissions")
            setSubmissions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectSubmission = (s: Submission) => {
        setSelectedSubmission(s)
        setFeedback(s.mentorFeedback || "")
    }

    const handleSubmitReview = async (status: "reviewed" | "rejected") => {
        if (!selectedSubmission || !feedback.trim()) {
            toast.error("Будь ласка, введіть фідбек")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/submissions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId: selectedSubmission.id,
                    feedback,
                    status
                })
            })

            if (res.ok) {
                toast.success("Рев'ю успішно збережено!")
                setSelectedSubmission(null)
                fetchSubmissions()
            } else {
                toast.error("Помилка при збереженні")
            }
        } catch (error) {
            toast.error("Сталася помилка")
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredSubmissions = submissions.filter(s => {
        const name = (s.userName || "").toLowerCase()
        const email = (s.userEmail || "").toLowerCase()
        const title = (s.taskTitle || "").toLowerCase()
        const q = searchQuery.toLowerCase()
        return name.includes(q) || email.includes(q) || title.includes(q)
    })

    return (
        <div className="min-h-screen bg-premium-dark text-slate-100 flex flex-col pt-16">
            <div className="flex flex-1 overflow-hidden">
                {/* List Sidebar */}
                <div className="w-full md:w-1/3 xl:w-1/4 border-r border-white/5 flex flex-col bg-slate-950/50">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-black text-white tracking-tight">Review Queue</h1>
                            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                                {submissions.filter(s => s.status === 'pending').length} Pending
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Search by student or task..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : filteredSubmissions.length === 0 ? (
                            <div className="p-12 text-center opacity-40 text-sm font-medium">Нових робіт поки немає.</div>
                        ) : (
                            filteredSubmissions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSelectSubmission(s)}
                                    className={`w-full p-5 text-left border-b border-white/5 transition-all group relative overflow-hidden ${selectedSubmission?.id === s.id ? "bg-blue-600/10" : "hover:bg-white/[0.02]"}`}
                                >
                                    {selectedSubmission?.id === s.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 transition-all">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{s.userName || s.userEmail || "Student"}</div>
                                                <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <BookOpen className="w-3 h-3" />
                                                    {s.taskTitle}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {s.status === 'pending' && (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-rose-500 text-white uppercase tracking-widest shadow-lg shadow-rose-500/20">NEW</span>
                                            )}
                                            {s.status === 'reviewed' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-3 pt-3 border-t border-white/5">
                                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-[#0f172a]">
                    {selectedSubmission ? (
                        <>
                            {/* Editor Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">{selectedSubmission.userName || selectedSubmission.userEmail || "Student"}</h2>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">{selectedSubmission.taskTitle}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SUBMITTED ON</div>
                                        <div className="text-xs font-bold text-white">{new Date(selectedSubmission.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="h-8 w-px bg-white/5" />
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedSubmission.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                        {selectedSubmission.status}
                                    </span>
                                </div>
                            </div>

                            {/* Main Split View */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Code Preview */}
                                <div className="flex-1 flex flex-col border-r border-white/5">
                                    <div className="bg-[#121212] px-6 py-3 border-b border-white/5 flex items-center justify-between">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Playwright Implementation</div>
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0">
                                        <CodeEditor 
                                            value={selectedSubmission.code} 
                                            onChange={() => {}} 
                                            readOnly={true} 
                                        />
                                    </div>
                                </div>

                                {/* Review Panel */}
                                <div className="w-full md:w-80 lg:w-96 p-8 flex flex-col bg-slate-950/30">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            <Send className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white">Mentor Feedback</h3>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide">ЗАЛИШИТИ ВІДГУК</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comments & Corrections (Markdown)</label>
                                            <textarea
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                placeholder="Write your review here... Tip: use Markdown for better formatting."
                                                className="w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all outline-none resize-none leading-relaxed placeholder:text-slate-700"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-white/5 space-y-3">
                                            <button
                                                onClick={() => handleSubmitReview("reviewed")}
                                                disabled={isSubmitting || !feedback.trim()}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 transform active:scale-[0.98] uppercase tracking-wider text-sm"
                                            >
                                                {isSubmitting ? "Saving..." : "Approve & Complete"}
                                            </button>
                                            <button
                                                onClick={() => handleSubmitReview("rejected")}
                                                disabled={isSubmitting || !feedback.trim()}
                                                className="w-full bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-3 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                            >
                                                Request Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6">
                                <Send className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Ready to Review</h2>
                            <p className="max-w-xs text-sm font-medium leading-relaxed">Оберіть роботу в списку зліва, щоб переглянути код та надати фідбек студенту.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
