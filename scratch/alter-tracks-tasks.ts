import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Altering tracks table...");
        await db.execute(sql`ALTER TABLE tracks ADD COLUMN title_en VARCHAR(255);`);
        await db.execute(sql`ALTER TABLE tracks ADD COLUMN title_ru VARCHAR(255);`);
        await db.execute(sql`ALTER TABLE tracks ADD COLUMN description_en TEXT;`);
        await db.execute(sql`ALTER TABLE tracks ADD COLUMN description_ru TEXT;`);
        
        console.log("Altering tasks table...");
        await db.execute(sql`ALTER TABLE tasks ADD COLUMN title_en VARCHAR(255);`);
        await db.execute(sql`ALTER TABLE tasks ADD COLUMN title_ru VARCHAR(255);`);
        await db.execute(sql`ALTER TABLE tasks ADD COLUMN description_en TEXT;`);
        await db.execute(sql`ALTER TABLE tasks ADD COLUMN description_ru TEXT;`);
        
        console.log("Done!");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
