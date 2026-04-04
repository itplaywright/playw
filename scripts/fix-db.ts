import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const run = async () => {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log("Creating tables manually...");
    
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS project_board_roles (
                id int AUTO_INCREMENT PRIMARY KEY,
                board_id int NOT NULL,
                role_id int NOT NULL,
                CONSTRAINT project_board_roles_board_id_fk FOREIGN KEY (board_id) REFERENCES project_boards(id) ON DELETE CASCADE,
                CONSTRAINT project_board_roles_role_id_fk FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            )
        `);
        console.log("Created project_board_roles");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS project_board_users (
                id int AUTO_INCREMENT PRIMARY KEY,
                board_id int NOT NULL,
                user_id varchar(255) NOT NULL,
                CONSTRAINT project_board_users_board_id_fk FOREIGN KEY (board_id) REFERENCES project_boards(id) ON DELETE CASCADE,
                CONSTRAINT project_board_users_user_id_fk FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `);
        console.log("Created project_board_users");

        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await connection.end();
    }
};

run();
