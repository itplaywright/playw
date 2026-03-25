import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function clean() {
    console.log("🧹 МАНУАЛЬНЕ ОЧИЩЕННЯ БАЗИ ДАНИХ...")
    
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not defined in .env.local")
        process.exit(1)
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
        const tables = ["user", "tasks", "tracks", "results", "questions", "project_boards"];
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const table of tables) {
            await connection.query(`TRUNCATE TABLE \`${table}\``);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("✅ БАЗА ДАНИХ ПОВНІСТЮ ОЧИЩЕНА.");
    } catch (err) {
        console.error("❌ Помилка при очищенні:", err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

clean();
