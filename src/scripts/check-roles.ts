import { db } from "@/db";
import { roles, projectBoardRoles } from "@/db/schema";

async function main() {
    const allRoles = await db.select().from(roles);
    console.log("All roles:", JSON.stringify(allRoles, null, 2));
    const boardRoles = await db.select().from(projectBoardRoles);
    console.log("Board roles:", JSON.stringify(boardRoles, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
