import { db } from "@/db";
import { projectBoards } from "@/db/schema";

async function main() {
    const boards = await db.select().from(projectBoards);
    console.log("Existing boards count:", boards.length);
    console.log("Existing boards:", JSON.stringify(boards, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
