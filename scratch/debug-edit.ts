import { db } from '@/db/index';
import { tasks, tracks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

async function main() {
  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, 1025),
    });
    console.log("Task:", task ? JSON.stringify({id: task.id, title: task.title}) : "NOT FOUND");

    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order));
    console.log("Tracks count:", allTracks.length);
  } catch(e: any) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
main();
