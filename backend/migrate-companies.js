import { getPool } from "./config/db.js";

export default async function migrateCompanies() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Companies" (
      "CompanyID" SERIAL PRIMARY KEY,
      "CompanyName" VARCHAR(255) NOT NULL,
      "CompanyEmail" VARCHAR(255),
      "CompanyPhone" VARCHAR(100),
      "CompanyAddress" VARCHAR(500),
      "CreatedAt" TIMESTAMP DEFAULT NOW(),
      "Status" VARCHAR(50) DEFAULT 'Active'
    );
  `);
  console.log('✓ Companies table created');

  const col = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Users' AND column_name = 'CompanyID'
    ) AS exists
  `);

  if (!col.rows[0].exists) {
    await pool.query(`ALTER TABLE "Users" ADD COLUMN "CompanyID" INT REFERENCES "Companies"("CompanyID")`);
    console.log('✓ Users.CompanyID added');
  } else {
    console.log('✓ Users.CompanyID already exists');
  }

  await pool.query(`
    UPDATE "Users" SET "CompanyID" = NULL WHERE "userType" = 'personal'
  `);
  console.log('✓ Personal users CompanyID set to NULL');

  console.log('Companies migration complete');
}
