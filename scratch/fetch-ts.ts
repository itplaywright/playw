import { db } from "../src/db/index.js";
import { tracks, tasks } from "../src/db/schema.js";
import fs from "fs";

async function main() {
    const allTracks = await db.select().from(tracks);
    const allTasks = await db.select().from(tasks);
    
    const tsTrack = allTracks.find(t => t.title.includes("TypeScript"));
    console.log("TS Track:", tsTrack);
    
    if (tsTrack) {
        const tsTasks = allTasks.filter(t => t.trackId === tsTrack.id);
        console.log("TS Tasks:", tsTasks.map(t => ({ id: t.id, numbering: t.numbering, title: t.title })));
    } else {
        console.log("TS Track not found, all tracks:");
        allTracks.forEach(t => console.log(t.id, t.title));
    }
    process.exit(0);
}

main();
