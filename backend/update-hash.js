import crypto from 'crypto';
import { getPool, sql } from './config/db.js';

const pool = await getPool();

// 要更新的用户和他们的明文密码（根据实际情况修改）
const users = [
    { userName: 'Alice', password: 'Pass123' },
    { userName: 'Peter', password: 'P123' }
];

for (const user of users) {
    const newHash = crypto.createHash('sha256').update(user.password).digest('hex');
    await pool.request()
        .input('hash', sql.NVarChar(255), newHash)
        .input('name', sql.NVarChar, user.userName)
        .query('UPDATE Users SET Password = @hash WHERE UserName = @name');
    console.log(`Updated ${user.userName} hash to: ${newHash}`);
}

pool.close();
console.log('All passwords updated. You can now login with the correct hashes.');