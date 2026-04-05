import { db } from "../src/db";
import { projectBoardRoles, projectBoardUsers, projectBoards } from "../src/db/schema";

async function check() {
    const roles = await db.select().from(projectBoardRoles);
    const users = await db.select().from(projectBoardUsers);
    const boards = await db.select().from(projectBoards);
    
    console.log("BOARDS:", boards);
    console.log("ROLES ASSIGNMENTS:", roles);
    console.log("USERS ASSIGNMENTS:", users);
    
    process.exit(0);
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
