import pg from 'pg';
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const r = await pool.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AvatarPath" VARCHAR(500)`);
console.log('Add AvatarPath:', r.command);
await pool.end();
