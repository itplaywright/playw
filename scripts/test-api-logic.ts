import { db } from "../src/db";
import { projectBoards, projectBoardRoles, projectBoardUsers } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function testApi() {
    const boardId = 1;

    // Manual fetching (MySQL compatibility fix)
    const boards = await db.select().from(projectBoards).where(eq(projectBoards.id, boardId));
    const board = boards[0];

    if (!board) {
        console.error("Board not found");
        process.exit(1);
    }

    const allowedRoles = await db.select().from(projectBoardRoles).where(eq(projectBoardRoles.boardId, boardId));
    const allowedUsers = await db.select().from(projectBoardUsers).where(eq(projectBoardUsers.boardId, boardId));

    const response = {
        ...board,
        allowedRoles,
        allowedUsers
    };

    console.log("FINAL RESPONSE OBJECT:", JSON.stringify(response, null, 2));
    process.exit(0);
}

testApi().catch(e => {
    console.error(e);
    process.exit(1);
});
