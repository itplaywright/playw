import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function diagnose() {
    try {
        console.log('--- Database Diagnosis ---');

        // Check enums
        console.log('\nChecking "status" enum values:');
        const enums = await db.execute(sql`
      SELECT n.nspname as schema, t.typname as type, e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'status';
    `);
        console.log(enums.rows);

        // Check results table columns
        console.log('\nChecking "results" table columns:');
        const columns = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'results';
    `);
        console.log(columns.rows);

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
