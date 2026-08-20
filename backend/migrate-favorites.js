import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gwMoiuLG9B6V@ep-frosty-moon-aytvjr8j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    const r1 = await pool.query(`
        CREATE TABLE IF NOT EXISTS "Favorites" (
            "FavoriteID" SERIAL PRIMARY KEY,
            "UserID" INT REFERENCES "Users"("UserID") ON DELETE CASCADE,
            "documentID" INT REFERENCES "Document"("documentID") ON DELETE CASCADE,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            UNIQUE ("UserID", "documentID")
        )
    `);
    console.log('Favorites table:', r1.command === 'CREATE TABLE' ? 'created' : 'already exists');

    const r2 = await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_userid ON "Favorites"("UserID")`);
    console.log('Index on UserID:', r2.command === 'CREATE INDEX' ? 'created' : 'already exists');

    const r3 = await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_docid ON "Favorites"("documentID")`);
    console.log('Index on documentID:', r3.command === 'CREATE INDEX' ? 'created' : 'already exists');

    await pool.end();
    console.log('Favorites migration complete!');
} catch (err) {
    console.error('Migration failed:', err.message);
    await pool.end();
    process.exit(1);
}
