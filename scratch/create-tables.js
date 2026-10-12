const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    await conn.query(`
        CREATE TABLE IF NOT EXISTS translations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            locale VARCHAR(10) NOT NULL,
            \`key\` VARCHAR(255) NOT NULL,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY locale_key_idx (locale, \`key\`)
        );
    `);
    
    await conn.query(`
        CREATE TABLE IF NOT EXISTS custom_blocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            \`order\` INT DEFAULT 0,
            is_visible BOOLEAN DEFAULT true,
            locale VARCHAR(10) DEFAULT 'uk',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    console.log('Tables created');
    await conn.end();
}
main().catch(console.error);
