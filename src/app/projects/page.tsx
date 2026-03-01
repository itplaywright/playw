import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards } from "@/db/schema"
import { redirect } from "next/navigation"
import ProjectsClient from "@/components/projects/ProjectsClient"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const boards = await db.query.projectBoards.findMany({
        orderBy: (boards, { desc }) => [desc(boards.createdAt)],
    })

    const isAdmin = (session.user as any).role === "admin"

    return <ProjectsClient initialBoards={boards as any} isAdmin={isAdmin} />
}
