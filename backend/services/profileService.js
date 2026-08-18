import { getPool } from '../config/db.js';

export async function getAvatarPath(userId) {
    const pool = await getPool();
    const result = await pool.query(
        `SELECT "AvatarPath" FROM "Users" WHERE "UserID" = $1`,
        [userId]
    );
    return result.rows[0]?.AvatarPath || null;
}

export async function saveAvatarPath(userId, avatarPath) {
    const pool = await getPool();
    await pool.query(
        `UPDATE "Users" SET "AvatarPath" = $1 WHERE "UserID" = $2`,
        [avatarPath, userId]
    );
}
