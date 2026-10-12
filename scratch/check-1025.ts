import { db } from '@/db/index';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, 1025)
  });
  console.log("Task 1025:", task ? "EXISTS" : "NOT FOUND");
  process.exit(0);
}
main();
