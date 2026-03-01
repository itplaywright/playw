
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectColumns, projectTasks, users as usersTable } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import KanbanBoard from "@/components/projects/KanbanBoard"
import Link from "next/link"
import { LayoutGrid, ChevronLeft, Plus, Settings } from "lucide-react"

export default async function ProjectBoardPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const boardId = parseInt(params.id)
    const board = await db.query.projectBoards.findFirst({
        where: eq(projectBoards.id, boardId),
        with: {
            columns: {
                orderBy: (columns, { asc }) => [asc(columns.order)],
            },
        },
    })

    if (!board) {
        notFound()
    }

    const tasks = await db.query.projectTasks.findMany({
        where: eq(projectTasks.boardId, boardId),
        with: {
            assignee: {
                columns: {
                    name: true,
                    image: true,
                },
            },
        },
    })

    const isAdmin = (session.user as any).role === "admin"
    const allUsers = isAdmin ? await db.select().from(usersTable) : []

    return (
        <ProjectBoardContent
            board={board}
            initialTasks={tasks}
            isAdmin={isAdmin}
            users={allUsers as any}
        />
    )
}

// Separate client component part for state handling (dialogs etc)
"use client"
import { useState } from "react"
import TaskDialog from "@/components/projects/TaskDialog"
import { useRouter } from "next/navigation"

function ProjectBoardContent({ board, initialTasks, isAdmin, users }: any) {
    const [showAddDialog, setShowAddDialog] = useState(false)
    const router = useRouter()

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Project Header */}
            <header className="flex-shrink-0 h-16 bg-[#0f172a] border-b border-white/10 flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white text-sm font-bold tracking-tight">{board.title}</h1>
                            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Project Board</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddDialog(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Додати задачу</span>
                        </button>
                    )}
                    <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Kanban Board Area */}
            <main className="flex-1 overflow-hidden">
                <KanbanBoard
                    initialTasks={initialTasks}
                    columns={board.columns.map((c: any) => ({ ...c, order: c.order ?? 0 }))}
                    isAdmin={isAdmin}
                    boardId={board.id}
                />
            </main>

            {showAddDialog && (
                <TaskDialog
                    boardId={board.id}
                    columnId={board.columns[0]?.id}
                    users={users}
                    onClose={() => setShowAddDialog(false)}
                    onSuccess={() => {
                        setShowAddDialog(false)
                        router.refresh()
                    }}
                />
            )}
        </div>
    )
}
