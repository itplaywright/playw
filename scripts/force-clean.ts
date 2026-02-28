import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function forceClean() {
    console.log('Force cleaning tasks and tracks...');
    await db.execute(sql`TRUNCATE TABLE "tasks", "tracks" RESTART IDENTITY CASCADE`);
    console.log('Cleaned. Now you can run seedDatabase.');
    process.exit(0);
}

forceClean().catch(console.error);
