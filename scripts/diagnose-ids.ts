import { db } from "../src/db";
import { roles, users, projectBoardRoles, projectBoardUsers } from "../src/db/schema";

async function diagnose() {
    const allRoles = await db.select().from(roles);
    console.log("ALL ROLES:", JSON.stringify(allRoles, null, 2));

    const allAssignments = await db.select().from(projectBoardRoles);
    console.log("ROLE ASSIGNMENTS:", JSON.stringify(allAssignments, null, 2));

    const userAssignments = await db.select().from(projectBoardUsers);
    console.log("USER ASSIGNMENTS:", JSON.stringify(userAssignments, null, 2));

    process.exit(0);
}

diagnose().catch(e => {
    console.error(e);
    process.exit(1);
});
