import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function checkTables() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        const [rows]: any = await connection.execute('SHOW TABLES');
        console.log('Tables:', rows.map((r: any) => Object.values(r)[0]));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkTables();
