require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [tracks] = await conn.query("SELECT id, title, `order` FROM tracks ORDER BY `order` ASC");
        console.log(`Found ${tracks.length} tracks:`);
        for (const tr of tracks) {
            const [tasks] = await conn.query(
                "SELECT id, numbering, title, title_en, title_ru, LENGTH(description) as d_len, LENGTH(description_en) as den_len, LENGTH(initial_code) as c_len, LENGTH(initial_code_en) as cen_len FROM tasks WHERE track_id = ? ORDER BY `order` ASC",
                [tr.id]
            );
            console.log(`\nTrack #${tr.id}: ${tr.title} (Tasks: ${tasks.length})`);
            for (const t of tasks) {
                console.log(`  - [${t.id}] ${t.numbering || ''} ${t.title} | EN title: ${t.title_en ? 'YES' : 'NO'} | EN desc: ${t.den_len ? 'YES' : 'NO'} | EN code: ${t.cen_len ? 'YES' : 'NO'}`);
            }
        }
    } finally {
        await conn.end();
    }
}
main().catch(console.error);
