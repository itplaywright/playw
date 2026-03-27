import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function resetSeen() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        await connection.execute('UPDATE task_submissions SET is_seen = FALSE WHERE status IN ("reviewed", "rejected")');
        console.log('✅ All reviewed/rejected submissions reset to unseen');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

resetSeen();
