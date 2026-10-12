require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [cols] = await conn.query("SHOW COLUMNS FROM tasks");
        const names = cols.map(c => c.Field);
        console.log("Current columns in tasks:", names.filter(n => n.includes('code')));

        if (!names.includes('initial_code_en')) {
            console.log("Adding initial_code_en...");
            await conn.query("ALTER TABLE tasks ADD COLUMN initial_code_en TEXT NULL");
            console.log("Added initial_code_en");
        }
        if (!names.includes('initial_code_ru')) {
            console.log("Adding initial_code_ru...");
            await conn.query("ALTER TABLE tasks ADD COLUMN initial_code_ru TEXT NULL");
            console.log("Added initial_code_ru");
        }
        console.log("DONE SCHEMA MIGRATION FOR INITIAL CODE");
    } finally {
        await conn.end();
    }
}
main().catch(console.error);
