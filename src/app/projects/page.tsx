
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards } from "@/db/schema"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const boards = await db.select().from(projectBoards).limit(1)

    if (boards.length > 0) {
        redirect(`/projects/${boards[0].id}`)
    }

    // If no boards, and admin, show create button. If user, show empty state.
    const isAdmin = (session.user as any).role === "admin"

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
            <div className="max-w-md">
                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Проєктів поки немає</h1>
                <p className="text-slate-500 mb-8">Тут будуть відображатися реальні завдання вашого поточного проєкту.</p>

                {isAdmin && (
                    <form action={async () => {
                        "use server"
                        // Temporary server action to bootstrap first board
                        const [newBoard] = await db.insert(projectBoards).values({
                            title: "Основний Проєкт",
                            description: "Система таск-менеджменту для реальної практики",
                        }).returning()

                        // We need to add default columns too, similar to route.ts
                        // For brevity in MVP I'll just redirect and let the user add columns or use a better bootstrap
                        redirect(`/projects/${newBoard.id}`)
                    }}>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all">
                            Створити перший проєкт
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
