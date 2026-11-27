import { auth } from "@/lib/auth"
import { db } from "@/db"
import { projectTasks, users as usersTable, projectBoardUsers, projectBoardRoles, roles } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq, and, asc } from "drizzle-orm"
import { alias } from "drizzle-orm/mysql-core"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const boardId = searchParams.get("boardId")

    if (!boardId) {
        return NextResponse.json({ error: "Board ID is required" }, { status: 400 })
    }

    const isAdmin = (session.user as any).role === "admin"
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
        updatedAt: projectTasks.updatedAt,
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
        .where(eq(projectTasks.boardId, parseInt(boardId)))
        .orderBy(asc(projectTasks.order))

    if (isAdmin) {
        return NextResponse.json(tasks)
    }

    // Resolve user's effective role for task access filtering
    const userRecord = await db.query.users.findFirst({
        where: eq(usersTable.id, session.user.id!)
    })
    let effectiveRoleId = userRecord?.dynamicRoleId
    if (!effectiveRoleId) {
        const [defaultRole] = await db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.isDefault, true))
            .limit(1)
        effectiveRoleId = defaultRole?.id
    }

    // Filter tasks for regular users:
    // 1. Personal tasks created by this user or assigned to this user are visible to them.
    // 2. Personal tasks created by other non-admin students are HIDDEN.
    // 3. Shared/Admin tasks are visible only if targetRoleIds is empty or matches effectiveRoleId.
    const accessibleTasks = tasks.filter(task => {
        const isMyPersonalTask = task.creatorId === session.user.id || task.assigneeId === session.user.id
        if (isMyPersonalTask) {
            return true
        }

        // Another student's personal task -> not visible
        const isCreatedByOtherStudent = task.creator && task.creator.role !== "admin"
        if (isCreatedByOtherStudent) {
            return false
        }

        // Admin/template task -> check role access
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

    return NextResponse.json(accessibleTasks)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await req.json()
        const boardId = Number(data.boardId)
        if (!boardId) {
            return NextResponse.json({ error: "Board ID is required" }, { status: 400 })
        }

        const isAdmin = (session.user as any).role === "admin"

        if (!isAdmin) {
            const userRecord = await db.query.users.findFirst({
                where: eq(usersTable.id, session.user.id!)
            })
            let effectiveRoleId = userRecord?.dynamicRoleId
            if (!effectiveRoleId) {
                const [defaultRole] = await db
                    .select({ id: roles.id })
                    .from(roles)
                    .where(eq(roles.isDefault, true))
                    .limit(1)
                effectiveRoleId = defaultRole?.id
            }

            // Verify user has access to this board
            const userAccess = await db.select().from(projectBoardUsers)
                .where(and(eq(projectBoardUsers.boardId, boardId), eq(projectBoardUsers.userId, session.user.id!)))

            const roleAccess = effectiveRoleId ? await db.select().from(projectBoardRoles)
                .where(and(eq(projectBoardRoles.boardId, boardId), eq(projectBoardRoles.roleId, effectiveRoleId))) : []

            if (userAccess.length === 0 && roleAccess.length === 0) {
                return NextResponse.json({ error: "Forbidden: You do not have access to this board" }, { status: 403 })
            }

            // Non-admin can only create tasks FOR THEMSELVES (private task)
            data.assigneeId = session.user.id
            data.targetRoleIds = null
        }

        const [__ir4] = await db.insert(projectTasks).values({
            ...data,
            boardId,
            creatorId: session.user.id,
            assigneeId: isAdmin ? (data.assigneeId || null) : session.user.id,
            targetRoleIds: isAdmin ? (data.targetRoleIds || null) : null,
        })
        const newTask = (await db.select().from(projectTasks).where(eq(projectTasks.id, __ir4.insertId)))[0]

        return NextResponse.json(newTask)
    } catch (error) {
        console.error("Failed to create task:", error)
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
}
