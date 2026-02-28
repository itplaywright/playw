
import { auth, signOut } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, results } from "@/db/schema"
import { redirect } from "next/navigation"
import Link from "next/link"
import { eq, and } from "drizzle-orm"
import { ArrowRight, LogOut, Terminal, Sparkles, Lock, Star } from "lucide-react"

export default async function Dashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (!(session.user as any).onboardingCompleted) {
        redirect("/onboarding")
    }

    const allTracks = await db.select().from(tracks).orderBy(tracks.order)
    const allTasks = await db.select().from(tasks).orderBy(tasks.order)
    const userResults = await db.select().from(results).where(eq(results.userId, session.user.id!))

    const isAdmin = (session.user as any).role === "admin"

    const visibleTracks = isAdmin ? allTracks : allTracks.filter(t => t.isActive)
    const visibleTasks = isAdmin ? allTasks : allTasks.filter(t => t.isActive)

    const getStatus = (taskId: number) => {
        const taskResults = userResults.filter(r => r.taskId === taskId)
        if (taskResults.some(r => r.status === 'passed')) return { label: 'Виконано', color: 'bg-green-100 text-green-800' }
        if (taskResults.length > 0) return { label: 'В процесі', color: 'bg-blue-100 text-blue-800' }
        return { label: 'Не розпочато', color: 'bg-gray-100 text-gray-800' }
    }

    const getDifficultyLabel = (diff: string | null) => {
        switch (diff) {
            case 'easy': return 'Легко'
            case 'medium': return 'Середньо'
            case 'hard': return 'Складно'
            default: return 'Легко'
        }
    }


    return (
        <div className="min-h-screen bg-background pb-20 text-foreground">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-blue-600/5 to-transparent blur-[120px] dark:from-blue-600/10" />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight mb-4">
                        Ваш шлях у автоматизацію
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Оберіть завдання та почніть практикуватися прямо зараз.
                    </p>
                </div>

                {/* Environment Setup Banner */}
                <Link href="/setup" className="group block mb-20">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-[1px] shadow-2xl transition-transform hover:scale-[1.01] duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full w-full rounded-[2.5rem] bg-slate-950/80 p-8 sm:p-12 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">

                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold tracking-wide mb-6">
                                    <Terminal className="w-4 h-4" />
                                    Крок 0. Фундамент
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Налаштування середовища
                                </h3>
                                <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                                    Перед тим як писати код, нам потрібно підготувати робочий простір. Встановіть Node.js, VS Code та Playwright за нашою детальною інструкцією.
                                </p>
                            </div>

                            <div className="flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                                <div className="bg-white text-indigo-950 px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all duration-500">
                                    Почати налаштування
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                        </div>
                    </div>
                </Link>

                {visibleTracks.map((track) => {
                    // Logic to determine if a track is "Pro"
                    const isProTrack = (track.order ?? 0) >= 3;

                    return (
                        <div key={track.id} className="mb-24 relative">
                            {/* Stylish track header */}
                            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-border/50 pb-6 gap-4 relative">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{track.title}</h3>
                                        {isProTrack && (
                                            <span className="inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20">
                                                <Star className="w-3 h-3 fill-current" />
                                                Pro
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-lg max-w-3xl">{track.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/50 px-4 py-2 rounded-2xl">
                                    <span>{visibleTasks.filter(t => t.trackId === track.id).length} завдань</span>
                                </div>
                            </div>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {visibleTasks
                                    .filter(task => task.trackId === track.id)
                                    .map((task) => {
                                        const status = getStatus(task.id)
                                        const statusColors = {
                                            'Виконано': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
                                            'В процесі': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
                                            'Не розпочато': 'bg-muted/50 text-muted-foreground border-border'
                                        }[status.label] || 'bg-muted/50 text-muted-foreground border-border'

                                        return (
                                            <Link
                                                key={task.id}
                                                href={`/tasks/${task.id}`}
                                                className="group flex flex-col bg-background/50 backdrop-blur-md rounded-3xl p-1 border hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-500 overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="p-7 flex-grow relative z-10">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${statusColors}`}>
                                                            {status.label}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            {isProTrack && <Lock className="w-4 h-4 text-orange-500/50" />}
                                                            <span className="text-muted-foreground/40 text-sm font-mono font-bold">#{task.order}</span>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-blue-600 transition-colors dark:group-hover:text-blue-400">
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                                        {task.description.split('\n').find(l => l.trim() && !l.startsWith('#')) || 'Немає опису'}
                                                    </p>
                                                </div>
                                                <div className="px-7 py-5 bg-muted/20 border-t border-border/50 flex justify-between items-center rounded-b-[1.4rem] relative z-10">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`w-2 h-2 rounded-full ${task.difficulty === 'easy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                                            task.difficulty === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                                            }`} />
                                                        <span className="text-sm font-bold text-muted-foreground">
                                                            {getDifficultyLabel(task.difficulty)}
                                                        </span>
                                                    </div>
                                                    <span className="text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center dark:text-blue-400">
                                                        Відкрити <ArrowRight className="ml-1 h-4 w-4" />
                                                    </span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                            </div>
                        </div>
                    )
                })}
            </main>
        </div>
    )
}
