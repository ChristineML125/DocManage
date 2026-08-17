import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.argv[2];
if (!connectionString) {
  console.error('Usage: node setup-neon.js <DATABASE_URL>');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
  console.log('Connecting to Neon...');
  await pool.query('SELECT 1');
  console.log('Connected! Running schema.sql...');
  await pool.query(schema);
  console.log('Schema created successfully!');

  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log('\nTables created:');
  tables.rows.forEach(r => console.log('  -', r.table_name));

  const counts = await pool.query(`
    SELECT 'Department' AS t, COUNT(*) AS c FROM "Department"
    UNION ALL SELECT 'Category', COUNT(*) FROM "Category"
    UNION ALL SELECT 'Branch', COUNT(*) FROM "Branch"
    UNION ALL SELECT 'Status', COUNT(*) FROM "Status"
    UNION ALL SELECT 'UserStatus', COUNT(*) FROM "UserStatus"
    UNION ALL SELECT 'Users', COUNT(*) FROM "Users"
  `);
  console.log('\nSeed data:');
  counts.rows.forEach(r => console.log(`  ${r.t}: ${r.c}`));

} catch (err) {
  console.error('ERROR:', err.message);
} finally {
  await pool.end();
}
