import { db } from "@/db";
import { projectBoards, projectColumns, projectTasks } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const columns = await db.select().from(projectColumns);
    const tasks = await db.select().from(projectTasks);
    console.log("Columns:", JSON.stringify(columns, null, 2));
    console.log("Tasks count:", tasks.length);
    console.log("Sample tasks:", JSON.stringify(tasks.slice(0, 5), null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
