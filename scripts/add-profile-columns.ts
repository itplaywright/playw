import { drizzle } from "drizzle-orm/mysql2"
import * as mysql from "mysql2/promise"
import * as dotenv from "dotenv"
import { sql } from "drizzle-orm"

dotenv.config({ path: ".env.local" })

const conn = mysql.createPool(process.env.DATABASE_URL!)
const db = drizzle(conn, { mode: "default" })

async function addProfileColumns() {
    console.log("Adding profile columns to user table...")
    
    const columnsToAdd = [
        { name: "first_name", def: "VARCHAR(255) NULL" },
        { name: "last_name", def: "VARCHAR(255) NULL" },
        { name: "phone", def: "VARCHAR(50) NULL" },
        { name: "telegram", def: "VARCHAR(255) NULL" },
        { name: "whatsapp", def: "VARCHAR(255) NULL" },
    ]

    for (const col of columnsToAdd) {
        try {
            await db.execute(sql.raw(`ALTER TABLE \`user\` ADD COLUMN \`${col.name}\` ${col.def}`))
            console.log(`✓ Added column: ${col.name}`)
        } catch (err: any) {
            if (err.code === "ER_DUP_FIELDNAME") {
                console.log(`⚠ Column already exists: ${col.name} — skipping`)
            } else {
                console.error(`✗ Error adding ${col.name}:`, err.message)
            }
        }
    }

    console.log("Done!")
    await conn.end()
    process.exit(0)
}

addProfileColumns()
