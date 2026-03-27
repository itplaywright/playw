import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkColumns() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        const [rows]: any = await connection.execute('DESCRIBE task_submissions');
        console.log('Columns:', rows.map((r: any) => r.Field));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkColumns();
