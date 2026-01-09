import { db } from './src/db';
import { users, tasks, results } from './src/db/schema';
import { count } from 'drizzle-orm';

async function check() {
    try {
        const userCount = await db.select({ value: count() }).from(users);
        const taskCount = await db.select({ value: count() }).from(tasks);
        const resultCount = await db.select({ value: count() }).from(results);

        console.log('Users:', userCount[0].value);
        console.log('Tasks:', taskCount[0].value);
        console.log('Results:', resultCount[0].value);

        if (taskCount[0].value > 0) {
            const firstTask = await db.select().from(tasks).limit(1);
            console.log('Sample Task:', firstTask[0]);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking DB:', err);
        process.exit(1);
    }
}

check();
