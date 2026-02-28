
import { auth, signOut } from "@/lib/auth"
import { db } from "@/db"
import { tasks, tracks, results } from "@/db/schema"
import { redirect } from "next/navigation"
import Link from "next/link"
import { eq, and } from "drizzle-orm"
import { ArrowRight, LogOut } from "lucide-react"

export default async function Dashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (!(session.user as any).onboardingCompleted) {
        redirect("/onboarding")
    }

    if ((session.user as any).learningPath === "theory") {
        redirect("/theory")
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

                {visibleTracks.map((track) => (
                    <div key={track.id} className="mb-20">
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
                            <div>
                                <h3 className="text-3xl font-bold text-foreground tracking-tight">{track.title}</h3>
                                <p className="text-muted-foreground mt-2 text-lg">{track.description}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
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
                                            className="group flex flex-col glass rounded-3xl p-1 hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative dark:glass-dark"
                                        >
                                            <div className="p-7 flex-grow">
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${statusColors}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className="text-muted-foreground/50 text-xs font-mono">#{task.order}</span>
                                                </div>
                                                <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-blue-600 transition-colors dark:group-hover:text-blue-400">
                                                    {task.title}
                                                </h4>
                                                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                                    {task.description.split('\n').find(l => l.trim() && !l.startsWith('#')) || 'Немає опису'}
                                                </p>
                                            </div>
                                            <div className="px-7 py-5 bg-muted/30 border-t border-border flex justify-between items-center rounded-b-[1.4rem]">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`w-2 h-2 rounded-full ${task.difficulty === 'easy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                                                        task.difficulty === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                                        }`} />
                                                    <span className="text-sm font-medium text-muted-foreground">
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
                ))}
            </main>
        </div>
    )
}
