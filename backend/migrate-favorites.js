import { getPool } from './config/db.js';

export default async function migrateFavorites() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Favorites" (
      "FavoriteID" SERIAL PRIMARY KEY,
      "UserID" INT REFERENCES "Users"("UserID") ON DELETE CASCADE,
      "documentID" INT REFERENCES "Document"("documentID") ON DELETE CASCADE,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE ("UserID", "documentID")
    )
  `);
  console.log('✓ Favorites table ensured');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_userid ON "Favorites"("UserID")`);
  console.log('✓ Favorites index on UserID');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_docid ON "Favorites"("documentID")`);
  console.log('✓ Favorites index on documentID');
}
