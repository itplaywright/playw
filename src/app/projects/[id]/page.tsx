
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectTasks, users as usersTable } from "@/db/schema"
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
