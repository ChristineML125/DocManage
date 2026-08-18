import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gwMoiuLG9B6V@ep-frosty-moon-aytvjr8j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    const r1 = await pool.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "userType" VARCHAR(20) DEFAULT 'company'`);
    console.log('Add userType column:', r1.command);

    const r2 = await pool.query(`ALTER TABLE "Users" ALTER COLUMN "DepartmentID" DROP NOT NULL`);
    console.log('Make DepartmentID nullable:', r2.command);

    const r3 = await pool.query(`INSERT INTO "Category" ("categoriesName", "description") VALUES ('Personal', 'Personal documents') ON CONFLICT DO NOTHING`);
    console.log('Personal category:', r3.rowCount > 0 ? 'created' : 'already exists');

    const r4 = await pool.query(`SELECT "UserName", "userType" FROM "Users" LIMIT 5`);
    console.log('Users:', r4.rows);

    await pool.end();
    console.log('Migration complete!');
} catch (err) {
    console.error('Migration failed:', err.message);
    await pool.end();
    process.exit(1);
}
