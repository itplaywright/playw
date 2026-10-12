import { db } from "./src/db/index.js";
import { tracks } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    const data = await db.select().from(tracks).where(eq(tracks.id, 72));
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
}
main();
