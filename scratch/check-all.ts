import { db } from "../src/db/index.js";
import { tasks, tracks } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    const allTracks = await db.select().from(tracks);
    console.log("=== ALL TRACKS ===");
    allTracks.forEach(t => console.log(`  id=${t.id} order=${t.order} active=${t.isActive} title="${t.title}"`));

    const allTasks = await db.select().from(tasks).where(eq(tasks.trackId, 72));
    console.log(`\n=== TASKS for track 72 (${allTasks.length} total) ===`);
    allTasks.forEach(t => console.log(`  id=${t.id} num=${t.numbering} active=${t.isActive} order=${t.order} title="${t.title}"`));

    const activeTasks = allTasks.filter(t => t.isActive);
    console.log(`\nActive tasks: ${activeTasks.length}`);
    
    process.exit(0);
}
main();
