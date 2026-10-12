const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    
    // Add localized title columns to menu_items
    try {
        await conn.query(`ALTER TABLE menu_items ADD COLUMN title_en VARCHAR(255) DEFAULT NULL`);
        console.log('Added title_en');
    } catch(e) { console.log('title_en already exists or error:', e.message); }
    
    try {
        await conn.query(`ALTER TABLE menu_items ADD COLUMN title_ru VARCHAR(255) DEFAULT NULL`);
        console.log('Added title_ru');
    } catch(e) { console.log('title_ru already exists or error:', e.message); }
    
    console.log('Done');
    await conn.end();
}
main().catch(console.error);
