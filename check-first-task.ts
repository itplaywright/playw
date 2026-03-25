import { db } from "./src/db/index";
import { tasks, tracks } from "./src/db/schema";
import { eq, asc } from "drizzle-orm";

async function main() {
    const [level1] = await db.select().from(tracks).where(eq(tracks.order, 1));
    if (!level1) {
        console.log("Level 1 not found");
        return;
    }
    const [firstTask] = await db.select().from(tasks).where(eq(tasks.trackId, level1.id)).orderBy(asc(tasks.order)).limit(1);
    console.log("First Task of Level 1:", firstTask);
}

main().catch(console.error).finally(() => process.exit(0));
