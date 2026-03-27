import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as mysql from "mysql2/promise";

async function runMigration() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    console.log("Connected to DB!");

    const stmts = [
        `CREATE TABLE \`access_codes\` (
            \`id\` int AUTO_INCREMENT NOT NULL,
            \`code\` varchar(255) NOT NULL,
            \`product_id\` int NOT NULL,
            \`max_uses\` int NOT NULL DEFAULT 1,
            \`used_count\` int NOT NULL DEFAULT 0,
            \`expires_at\` timestamp NULL,
            \`is_active\` boolean DEFAULT true,
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT \`access_codes_id\` PRIMARY KEY(\`id\`),
            CONSTRAINT \`access_codes_code_unique\` UNIQUE(\`code\`)
        )`,
        `ALTER TABLE \`access_codes\` ADD CONSTRAINT \`access_codes_product_id_products_id_fk\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE cascade ON UPDATE no action`
    ];

    for (let i = 0; i < stmts.length; i++) {
        try {
            await conn.execute(stmts[i]);
            console.log(`✅ Statement ${i + 1} completed.`);
        } catch (e: any) {
            console.error(`❌ Error executing statement ${i + 1}:`, e);
        }
    }

    await conn.end();
    console.log("🏁 Migration completed!");
}

runMigration().catch(console.error);
