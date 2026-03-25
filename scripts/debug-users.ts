import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import * as mysql from "mysql2/promise";
import * as fs from "fs";

async function test() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not defined in .env.local")
        process.exit(1)
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
        const [rows] = await connection.query('SELECT email, role FROM user');
        let output = "Users in DB:\n";
        (rows as any[]).forEach(r => {
            output += `- ${r.email} [${r.role}]\n`;
        });
        fs.writeFileSync("db_users_debug.txt", output);
        console.log("Results written to db_users_debug.txt");
    } catch (err) {
        fs.writeFileSync("db_users_debug.txt", "ERROR: " + String(err));
    } finally {
        await connection.end();
    }
}

test().catch(console.error)
