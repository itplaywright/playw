import { db } from "./index"
import { tasks } from "./schema"

async function main() {
    const allTasks = await db.select().from(tasks).limit(5)
    console.log(allTasks.map(t => ({ id: t.id, title: t.title, type: t.type })))
    process.exit(0)
}
main()
