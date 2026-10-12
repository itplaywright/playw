import { db } from "../src/db/index.js";
import { tracks, tasks } from "../src/db/schema.js";

async function main() {
    const allTracks = await db.select().from(tracks);
    const allTasks = await db.select().from(tasks);
    
    console.log("TRACKS:", JSON.stringify(allTracks, null, 2));
    console.log("TASKS:", JSON.stringify(allTasks, null, 2));
    process.exit(0);
}

main();
