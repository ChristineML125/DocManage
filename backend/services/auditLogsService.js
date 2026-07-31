import {getPool, sql} from "../config/db.js";

export async function listAuditLogs(filters = {}){
    const pool = await getPool();

    const request = pool.request()
    .input("action", sql.NVarChar(50), filters.action || null)
    .input("departmentId", sql.Int, filters.departmentId ? Number(filters.departmentId) : null)

    const result = await request.query(`
        SELECT
            a.AuditLogID AS id,
            executor.UserName AS UserName,
            a.Action,

            CASE
                WHEN a.targetEntity = 'User'
                THEN targetUser.UserName

                WHEN a.targetEntity = 'Document'
                THEN targetDoc.documentName

                ELSE a.targetEntity
            END AS targetEntity,

            a.targetID,
            a.description,
            a.[timestamp]

        FROM AuditLog a

        LEFT JOIN Users executor
        ON a.UserID = executor.UserID

        LEFT JOIN Users targetUser
        ON a.targetEntity='User'
        AND a.targetID = targetUser.UserID

        LEFT JOIN Document targetDoc
        ON a.targetEntity='Document'
        AND a.targetID = targetDoc.documentID

        ORDER BY a.[timestamp] DESC
    `);

    return result.recordset;
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

    await pool.request()
    .input("UserID", sql.Int, userID)
    .input("Action", sql.VarChar(50), action)
    .input("documentID", sql.Int, documentID)
    .input("description", sql.VarChar(255), description)
    .input("targetEntity", sql.VarChar(255), targetEntity)
    .input("targetID", sql.Int, targetID)
    .query(`
        INSERT INTO AuditLog
        (
            UserID,
            Action,
            documentID,
            description,
            targetEntity,
            targetID,
            timestamp
        )
        VALUES
        (
            @UserID,
            @Action,
            @documentID,
            @description,
            @targetEntity,
            @targetID,
            GETDATE()
        )
    `);

}