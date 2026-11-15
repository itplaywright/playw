import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS project_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            board_id INT NOT NULL,
            task_id INT NOT NULL,
            github_url VARCHAR(500),
            code TEXT,
            notes TEXT,
            mentor_feedback TEXT,
            status ENUM('pending', 'reviewed', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP NULL,
            INDEX idx_user (user_id),
            INDEX idx_board (board_id),
            INDEX idx_task (task_id)
        )
    `);
    console.log("Successfully created project_submissions table");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
