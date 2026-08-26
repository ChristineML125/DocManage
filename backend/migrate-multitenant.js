import { getPool } from "./config/db.js";

// Multi-tenancy migration:
// 1. Adds "CompanyID" to "Department" and "Category" (tenant-owned lookup data)
// 2. Ensures a demo company exists
// 3. Assigns all legacy tenant-less rows (users / departments / categories)
//    to the demo company so existing data stays with the original account.
//
// Safe to run multiple times - every step checks before it changes.

export default async function migrateMultitenant() {
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

  for (const table of ["Department", "Category"]) {
    const col = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = $1 AND column_name = 'CompanyID'
       ) AS exists`,
      [table]
    );
    if (!col.rows[0].exists) {
      await pool.query(
        `ALTER TABLE "${table}" ADD COLUMN "CompanyID" INT REFERENCES "Companies"("CompanyID")`
      );
      console.log(`✓ ${table}.CompanyID added`);
    } else {
      console.log(`✓ ${table}.CompanyID already exists`);
    }
  }

  // Find the first existing company, or create the demo company.
  let demo = await pool.query(
    `SELECT "CompanyID" FROM "Companies" ORDER BY "CompanyID" LIMIT 1`
  );
  let companyID;
  if (demo.rows.length > 0) {
    companyID = demo.rows[0].CompanyID;
    console.log(`✓ Using existing company #${companyID} as legacy owner`);
  } else {
    const created = await pool.query(
      `INSERT INTO "Companies" ("CompanyName") VALUES ($1) RETURNING "CompanyID"`,
      ['Demo Company']
    );
    companyID = created.rows[0].CompanyID;
    console.log(`✓ Created 'Demo Company' (#${companyID})`);
  }

  const users = await pool.query(
    `UPDATE "Users"
     SET "CompanyID" = $1
     WHERE ("userType" IS NULL OR "userType" = 'company')
       AND "CompanyID" IS NULL
     RETURNING "UserID"`,
    [companyID]
  );
  console.log(`✓ Assigned ${users.rowCount} legacy user(s) to company #${companyID}`);

  const departments = await pool.query(
    `UPDATE "Department" SET "CompanyID" = $1 WHERE "CompanyID" IS NULL RETURNING "departmentID"`,
    [companyID]
  );
  console.log(`✓ Assigned ${departments.rowCount} legacy department(s) to company #${companyID}`);

  const categories = await pool.query(
    `UPDATE "Category" SET "CompanyID" = $1 WHERE "CompanyID" IS NULL RETURNING "categoriesID"`,
    [companyID]
  );
  console.log(`✓ Assigned ${categories.rowCount} legacy category(ies) to company #${companyID}`);

  console.log('Multi-tenancy migration complete');
}

// Allow running directly: node migrate-multitenant.js
if (process.argv[1] && process.argv[1].endsWith('migrate-multitenant.js')) {
  migrateMultitenant()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
