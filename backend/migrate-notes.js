import { getPool } from './config/db.js';

export default async function migrateNotes() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Note" (
      "noteID" SERIAL PRIMARY KEY,
      "documentID" INT REFERENCES "Document"("documentID") ON DELETE CASCADE,
      "userID" INT REFERENCES "Users"("UserID") ON DELETE CASCADE,
      "noteTitle" VARCHAR(255),
      "noteContent" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ Note table ensured');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_note_userid ON "Note"("userID")`);
  console.log('✓ Note index on userID');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_note_docid ON "Note"("documentID")`);
  console.log('✓ Note index on documentID');
}
