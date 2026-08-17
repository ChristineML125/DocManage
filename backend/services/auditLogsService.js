import {getPool} from "../config/db.js";

export async function listAuditLogs(filters = {}){
    const pool = await getPool();

    const params = [filters.action || null, filters.departmentId ? Number(filters.departmentId) : null];

    const result = await pool.query(`
        SELECT
            a."AuditLogID" AS id,
            executor."UserName" AS "UserName",
            a."Action",

            CASE
                WHEN a."targetEntity" = 'User'
                THEN targetUser."UserName"

                WHEN a."targetEntity" = 'Document'
                THEN targetDoc."documentName"

                ELSE a."targetEntity"
            END AS "targetEntity",

            a."targetID",
            a."description",
            a."timestamp"

        FROM "AuditLog" a

        LEFT JOIN "Users" executor
        ON a."UserID" = executor."UserID"

        LEFT JOIN "Users" targetUser
        ON a."targetEntity"='User'
        AND a."targetID" = targetUser."UserID"

        LEFT JOIN "Document" targetDoc
        ON a."targetEntity"='Document'
        AND a."targetID" = targetDoc."documentID"

        ORDER BY a."timestamp" DESC
    `);

    return result.rows;
}

export async function addAuditLog({
    userID,
    action,
    targetEntity,
    targetID,
    documentID = null,
    description
}) {

    const pool = await getPool();

    await pool.query(`
        INSERT INTO "AuditLog"
        (
            "UserID",
            "Action",
            "documentID",
            "description",
            "targetEntity",
            "targetID",
            "timestamp"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `,
    [userID, action, documentID, description, targetEntity, targetID]);

}
