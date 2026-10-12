const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
        await conn.query(`ALTER TABLE user ADD COLUMN programming_language VARCHAR(50) DEFAULT NULL`);
        console.log('Added programming_language');
    } catch(e) { console.log('programming_language already exists or error:', e.message); }
    
    console.log('Done');
    await conn.end();
}
main().catch(console.error);
