import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        await connection.execute('ALTER TABLE task_submissions ADD COLUMN is_seen BOOLEAN DEFAULT FALSE;');
        console.log('✅ task_submissions table updated with is_seen column');
    } catch (err) {
        console.error('❌ Error updating table:', err);
    } finally {
        await connection.end();
    }
}

migrate();
