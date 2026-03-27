import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTable() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS task_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                task_id INT NOT NULL,
                code TEXT NOT NULL,
                mentor_feedback TEXT,
                status ENUM('pending', 'reviewed', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            );
        `;
        await connection.execute(sql);
        console.log('✅ task_submissions table created successfully');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    } finally {
        await connection.end();
    }
}

createTable();
