require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [tracks] = await conn.query("SELECT id, title FROM tracks ORDER BY `order` ASC");
        console.log("All tracks:");
        for (const t of tracks) {
            const [tasks] = await conn.query("SELECT COUNT(*) as c FROM tasks WHERE track_id = ?", [t.id]);
            console.log(`- ID: ${t.id} | ${t.title} | Tasks: ${tasks[0].c}`);
        }
    } finally {
        await conn.end();
    }
}
main().catch(console.error);
