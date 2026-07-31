import crypto from 'crypto';
import { getPool, sql } from './config/db.js';

async function migratePasswords() {
    const pool = await getPool();
    try {
        const users = await pool.request().query('SELECT * FROM Users');
        console.log(`Found ${users.recordset.length} users.`);

        for (const user of users.recordset) {
            if (user.Password && user.Password.length < 64) {
                const hash = crypto.createHash('sha256').update(user.Password).digest('hex');
                await pool.request()
                    .input('id', sql.Int, user.UserID)
                    .input('pwd', sql.NVarChar(255), hash)
                    .query('UPDATE Users SET Password = @pwd WHERE UserID = @id');
                console.log(`✅ Migrated user: ${user.UserName} (ID: ${user.UserID})`);
            } else {
                console.log(`⏭️ Skipped user: ${user.UserName} (already hashed or empty)`);
            }
        }
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.close();
    }
}

migratePasswords();