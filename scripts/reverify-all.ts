import { db } from "../src/db";
import { users, projectBoards, projectBoardRoles, projectBoardUsers, roles } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function reverify() {
    const testEmail = "AlexLitvinenko123@gmail.com";
    const boardId = 1;

    console.log(`Checking access for ${testEmail} to board ${boardId}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, testEmail)
    });

    if (!user) {
        console.error("Test user not found");
        process.exit(1);
    }

    console.log(`User ID: ${user.id}, Dynamic Role ID: ${user.dynamicRoleId}`);

    const board = await db.query.projectBoards.findFirst({
        where: eq(projectBoards.id, boardId)
    });

    if (!board) {
        console.error("Board not found");
        process.exit(1);
    }

    console.log(`Board Title: ${board.title}`);

    const roleAssignments = await db.select().from(projectBoardRoles).where(eq(projectBoardRoles.boardId, boardId));
    console.log("Role Assignments for this board:", JSON.stringify(roleAssignments, null, 2));

    const userAssignments = await db.select().from(projectBoardUsers).where(eq(projectBoardUsers.boardId, boardId));
    console.log("User Assignments for this board:", JSON.stringify(userAssignments, null, 2));

    // Simulation of [id]/page.tsx logic
    const userRoleId = user.dynamicRoleId;
    const roleAccess = userRoleId ? roleAssignments.filter(a => Number(a.roleId) === Number(userRoleId)) : [];
    const userAccess = userAssignments.filter(a => a.userId === user.id);

    console.log("--- RESULTS ---");
    console.log(`Role Access Match: ${roleAccess.length > 0}`);
    console.log(`User Access Match: ${userAccess.length > 0}`);
    console.log(`FINAL PERMISSION: ${roleAccess.length > 0 || userAccess.length > 0 ? "GRANTED" : "DENIED"}`);

    process.exit(0);
}

reverify().catch(e => {
    console.error(e);
    process.exit(1);
});
