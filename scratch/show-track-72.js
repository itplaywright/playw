require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [tasks] = await conn.query("SELECT id, numbering, title FROM tasks WHERE track_id = 72 ORDER BY `order` ASC");
        console.log("Tasks in Track 72 (Рівень 0 — Основи TypeScript):");
        tasks.forEach(t => console.log(`  [ID ${t.id}] ${t.numbering || ''} - ${t.title}`));
    } finally {
        await conn.end();
    }
}
main().catch(console.error);
