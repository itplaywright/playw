"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutGrid, ChevronLeft, Plus, Settings } from "lucide-react"
import KanbanBoard from "@/components/projects/KanbanBoard"
import TaskDialog from "@/components/projects/TaskDialog"
import EditProjectDialog from "@/components/projects/EditProjectDialog"
import { useRouter } from "next/navigation"

interface Props {
    board: any
    initialTasks: any[]
    isAdmin: boolean
    users: any[]
}

export default function ProjectBoardContent({ board, initialTasks, isAdmin, users }: Props) {
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)
    const router = useRouter()

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Project Header */}
            <header className="flex-shrink-0 h-16 bg-[#0f172a] border-b border-white/10 flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/projects" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
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
                        <>
                            <button
                                onClick={() => setShowAddDialog(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Додати задачу</span>
                            </button>
                            <button
                                onClick={() => setShowSettingsDialog(true)}
                                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Kanban Board Area */}
            <main className="flex-1 overflow-hidden">
                <KanbanBoard
                    initialTasks={initialTasks}
                    columns={board.columns.map((c: any) => ({ ...c, order: c.order ?? 0 }))}
                    isAdmin={isAdmin}
                    boardId={board.id}
                    users={users}
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

            {showSettingsDialog && (
                <EditProjectDialog
                    board={board}
                    onClose={() => setShowSettingsDialog(false)}
                    onSuccess={() => {
                        setShowSettingsDialog(false)
                        router.refresh()
                    }}
                />
            )}
        </div>
    )
}
