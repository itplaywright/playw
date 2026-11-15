import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    const [rows] = await db.execute(sql`SHOW TABLES`);
    console.log("Tables in database:", rows);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
