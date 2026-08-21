import { getPool } from './config/db.js';

export default async function migrateFolders() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Folder" (
      "folderID" SERIAL PRIMARY KEY,
      "folderName" VARCHAR(255) NOT NULL,
      "parentFolderID" INT REFERENCES "Folder"("folderID") ON DELETE CASCADE,
      "userID" INT REFERENCES "Users"("UserID") ON DELETE CASCADE,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ Folder table ensured');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_folder_userid ON "Folder"("userID")`);
  console.log('✓ Folder index on userID');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_folder_parent ON "Folder"("parentFolderID")`);
  console.log('✓ Folder index on parentFolderID');

  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "folderID" INT REFERENCES "Folder"("folderID") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `);
  console.log('✓ Document.folderID column ensured');
}
