
import { db } from "../src/db"
import { projectBoards, projectColumns, projectTasks } from "../src/db/schema"
import { eq } from "drizzle-orm"

async function test() {
    console.log("Checking for boards...")
    const boards = await db.select().from(projectBoards)
    console.log(`Found ${boards.length} boards.`)

    if (boards.length > 0) {
        const boardId = boards[0].id
        const columns = await db.select().from(projectColumns).where(eq(projectColumns.boardId, boardId))
        console.log(`Board ${boardId} has ${columns.length} columns.`)

        const tasks = await db.select().from(projectTasks).where(eq(projectTasks.boardId, boardId))
        console.log(`Board ${boardId} has ${tasks.length} tasks.`)
    }
}

test().catch(console.error)
