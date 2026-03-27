import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUnread() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        const [rows]: any = await connection.execute('SELECT id, user_id, status, is_seen FROM task_submissions WHERE status IN ("reviewed", "rejected") ORDER BY created_at DESC LIMIT 5');
        console.log('Last submissions:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkUnread();
