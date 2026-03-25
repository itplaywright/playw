import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "../src/db/schema";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
    console.log("Checking database connection...")
    
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not defined in .env.local")
        process.exit(1)
    }

    const pool = mysql.createPool(process.env.DATABASE_URL);
    const db = drizzle(pool);
    
    try {
        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            isBlocked: users.isBlocked
        }).from(users)
        
        console.log(`Success! Found ${allUsers.length} users.`)
        allUsers.forEach(u => {
            console.log(`- ${u.email}: ID=${u.id}, Role=${u.role}, Blocked=${u.isBlocked}`)
        })
    } catch (err) {
        console.error("Database query failed:", err)
    } finally {
        await pool.end();
    }
}

test().catch(console.error)
