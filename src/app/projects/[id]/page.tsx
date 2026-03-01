import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectTasks, projectColumns, users as usersTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import ProjectBoardContent from "@/components/projects/ProjectBoardContent"

export default async function ProjectBoardPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const { id } = await params
    const boardId = parseInt(id)

    let board = await db.query.projectBoards.findFirst({
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

    // Fallback: If no columns exist (e.g. board created before bootstrap logic fixed), create them
    if (board.columns.length === 0) {
        const defaultColumns = [
            { title: "To Do", order: 1, color: "#94a3b8", boardId: board.id },
            { title: "In Progress", order: 2, color: "#3b82f6", boardId: board.id },
            { title: "Review", order: 3, color: "#eab308", boardId: board.id },
            { title: "Done", order: 4, color: "#22c55e", boardId: board.id },
        ]
        await db.insert(projectColumns).values(defaultColumns)

        // Re-fetch with columns
        board = await db.query.projectBoards.findFirst({
            where: eq(projectBoards.id, boardId),
            with: {
                columns: {
                    orderBy: (columns, { asc }) => [asc(columns.order)],
                },
            },
        }) as any
    }

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
