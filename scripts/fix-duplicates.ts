import { db } from '../src/db/index';
import { tasks } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
    const allTasks = await db.select().from(tasks).where(eq(tasks.trackId, 1)).orderBy(tasks.order);

    // Group by title to find duplicates
    const grouped = new Map<string, typeof allTasks[0][]>();
    for (const t of allTasks) {
        if (!grouped.has(t.title)) grouped.set(t.title, []);
        grouped.get(t.title)!.push(t);
    }

    // Find duplicates
    let duplicatesFound = false;
    for (const [title, group] of grouped.entries()) {
        if (group.length > 1) {
            console.log(`Duplicate found for: ${title} (${group.length} copies)`);
            duplicatesFound = true;

            // keep the first one, delete the rest
            for (let i = 1; i < group.length; i++) {
                await db.delete(tasks).where(eq(tasks.id, group[i].id));
                console.log(`  Deleted duplicate ID: ${group[i].id}`);
            }
        }
    }

    if (!duplicatesFound) {
        console.log('No duplicates found.');
    }

    // Re-fetch and list order
    const finalTasks = await db.select().from(tasks).where(eq(tasks.trackId, 1)).orderBy(tasks.order);
    console.log('\n--- Final Order ---');
    for (const t of finalTasks) {
        console.log(`${t.order}: ${t.title}`);
    }

    process.exit(0);
}

run().catch(console.error);
