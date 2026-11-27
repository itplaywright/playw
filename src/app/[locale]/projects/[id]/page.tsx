import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectBoards, projectTasks, projectColumns, users as usersTable, roles, projectBoardRoles, projectBoardUsers } from "@/db/schema"
import { eq, asc, and, or } from "drizzle-orm"
import { alias } from "drizzle-orm/mysql-core"
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

    let effectiveRoleId = userRecord?.dynamicRoleId
    if (!effectiveRoleId) {
        const [defaultRole] = await db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.isDefault, true))
            .limit(1)
        effectiveRoleId = defaultRole?.id
    }

    // Role & Project Specific Validation
    if ((session.user as any).role !== "admin") {
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

    // Fallback: If no columns exist, create default Jira columns
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

    const creatorTable = alias(usersTable, "creator")

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
        targetRoleIds: projectTasks.targetRoleIds,
        status: projectTasks.status,
        priority: projectTasks.priority,
        order: projectTasks.order,
        createdAt: projectTasks.createdAt,
        assignee: {
            id: usersTable.id,
            name: usersTable.name,
            image: usersTable.image,
        },
        creator: {
            id: creatorTable.id,
            name: creatorTable.name,
            role: creatorTable.role,
        }
    })
        .from(projectTasks)
        .leftJoin(usersTable, eq(projectTasks.assigneeId, usersTable.id))
        .leftJoin(creatorTable, eq(projectTasks.creatorId, creatorTable.id))
        .where(eq(projectTasks.boardId, boardId))

    const isAdmin = (session.user as any).role === "admin"
    const allUsersList = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable).orderBy(asc(usersTable.name)).limit(100)
    const allRolesList = await db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name))

    // Filter tasks:
    // 1. Language stack filter
    // 2. Role-based task restrictions + private personal tasks
    const filteredTasks = tasks.filter(task => {
        const t = (task.title + " " + (task.titleEn || "") + " " + (task.description || "") + " " + (task.descriptionEn || "")).toLowerCase()
        const isPython = t.includes("python")
        const isCSharp = t.includes("c#") || t.includes(".net") || t.includes("csharp")

        if (userLanguage === "python" && !isPython) return false
        if (userLanguage === "csharp" && !isCSharp) return false
        if (userLanguage !== "python" && userLanguage !== "csharp" && (isPython || isCSharp)) return false

        // Admin sees all tasks for their chosen language
        if (isAdmin) return true

        // For regular students:
        // A. Is this the student's own task?
        const isMyPersonalTask = task.creatorId === session.user.id || task.assigneeId === session.user.id
        if (isMyPersonalTask) return true

        // B. Was this created by another non-admin student? Private to them -> hide it!
        if (task.creator && task.creator.role !== "admin") return false

        // C. Shared admin template task -> check role access
        if (!task.targetRoleIds || task.targetRoleIds === "all" || task.targetRoleIds.trim() === "") {
            return true
        }

        const allowedRoleIds = task.targetRoleIds.split(',')
            .map(s => parseInt(s.replace(/[^0-9]/g, '')))
            .filter(n => !isNaN(n))

        if (effectiveRoleId && allowedRoleIds.includes(effectiveRoleId)) {
            return true
        }

        return false
    })

    return (
        <ProjectBoardContent
            board={board}
            initialTasks={filteredTasks}
            isAdmin={isAdmin}
            users={allUsersList as any}
            roles={allRolesList as any}
            userLanguage={userLanguage}
            currentUserId={session.user.id}
            canManageTasks={true}
        />
    )
}
