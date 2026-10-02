import { getPool } from "./config/db.js";

export default async function migrateBilling() {
  const pool = await getPool();

  await pool.query(`
    ALTER TABLE "Document"
    ADD COLUMN IF NOT EXISTS "fileSizeBytes" BIGINT DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE "DocumentVersion"
    ADD COLUMN IF NOT EXISTS "fileSizeBytes" BIGINT DEFAULT 0
  `);
  console.log("✓ Storage size columns ensured");
}
