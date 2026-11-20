import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectTasks, projectColumns, users as usersTable, roles, projectBoardRoles, projectBoardUsers } from "@/db/schema"
import { eq, asc, and, or } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import ProjectBoardContent from "@/components/projects/ProjectBoardContent"

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const { id, locale } = await params
    const boardId = parseInt(id)

    const userRecord = await db.query.users.findFirst({
        where: eq(usersTable.id, session.user.id!)
    })
    const userLanguage = userRecord?.programmingLanguage || "typescript"

    // Role & Project Specific Validation
    if ((session.user as any).role !== "admin") {
        let effectiveRoleId = userRecord?.dynamicRoleId
        if (!effectiveRoleId) {
            const [defaultRole] = await db
                .select({ id: roles.id })
                .from(roles)
                .where(eq(roles.isDefault, true))
                .limit(1)
            effectiveRoleId = defaultRole?.id
        }

        // 1. Check direct user assignment
        const userAccess = await db.select().from(projectBoardUsers)
            .where(and(eq(projectBoardUsers.boardId, boardId), eq(projectBoardUsers.userId, session.user.id!)))

        // 2. Check role-based assignment (supports both dynamicRoleId and default Demo role)
        const roleAccess = effectiveRoleId ? await db.select().from(projectBoardRoles)
            .where(and(eq(projectBoardRoles.boardId, boardId), eq(projectBoardRoles.roleId, effectiveRoleId))) : []

        if (userAccess.length === 0 && roleAccess.length === 0) {
            redirect("/projects")
        }
    }

    let board = (await db.select().from(projectBoards).where(eq(projectBoards.id, boardId)))[0] as any;
    if (board) {
        board.title = locale === 'en' ? (board.titleEn || board.title) : locale === 'ru' ? (board.titleRu || board.title) : board.title
        board.description = locale === 'en' ? (board.descriptionEn || board.description) : locale === 'ru' ? (board.descriptionRu || board.description) : board.description
        board.columns = await db.select().from(projectColumns)
            .where(eq(projectColumns.boardId, boardId))
            .orderBy(asc(projectColumns.order));
    }

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

        // Re-fetch columns
        board.columns = await db.select().from(projectColumns)
            .where(eq(projectColumns.boardId, boardId))
            .orderBy(asc(projectColumns.order));
    }

    if (!board) {
        notFound()
    }

    const tasks = await db.select({
        id: projectTasks.id,
        boardId: projectTasks.boardId,
        columnId: projectTasks.columnId,
        title: projectTasks.title,
        titleEn: projectTasks.titleEn,
        titleRu: projectTasks.titleRu,
        description: projectTasks.description,
        descriptionEn: projectTasks.descriptionEn,
        descriptionRu: projectTasks.descriptionRu,
        assigneeId: projectTasks.assigneeId,
        creatorId: projectTasks.creatorId,
        status: projectTasks.status,
        priority: projectTasks.priority,
        order: projectTasks.order,
        createdAt: projectTasks.createdAt,
        assignee: {
            name: usersTable.name,
            image: usersTable.image,
        }
    })
        .from(projectTasks)
        .leftJoin(usersTable, eq(projectTasks.assigneeId, usersTable.id))
        .where(eq(projectTasks.boardId, boardId))

    const isAdmin = (session.user as any).role === "admin"
    const allUsersList = isAdmin ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable).orderBy(asc(usersTable.name)) : []
    const allRolesList = isAdmin ? await db.select().from(roles).orderBy(asc(roles.name)) : []

    // Filter tasks strictly by student's programming language (TypeScript by default)
    // Hides tasks for all other stacks so the student only sees what they are studying
    const filteredTasks = tasks.filter(task => {
        const t = (task.title + " " + (task.titleEn || "") + " " + (task.description || "") + " " + (task.descriptionEn || "")).toLowerCase()
        const isPython = t.includes("python")
        const isCSharp = t.includes("c#") || t.includes(".net") || t.includes("csharp")

        if (userLanguage === "python") return isPython
        if (userLanguage === "csharp") return isCSharp
        // Default TypeScript: only show TypeScript & general Playwright tasks; hide Python and C#
        return !isPython && !isCSharp
    })

    return (
        <ProjectBoardContent
            board={board}
            initialTasks={filteredTasks}
            isAdmin={isAdmin}
            users={allUsersList as any}
            roles={allRolesList as any}
            userLanguage={userLanguage}
        />
    )
}
