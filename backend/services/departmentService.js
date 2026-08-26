import {getPool} from "../config/db.js";

export async function getDepartmentLoad(companyID = null) {
    const pool = await getPool();
    const result = await pool.query(`
        SELECT
            d."departmentID" AS id,
            d."departmentName" AS "departmentName",
            COUNT(doc."documentID")::int AS "documentCount"
        FROM "Department" d
        LEFT JOIN "Document" doc ON d."departmentID" = doc."departmentID"
        LEFT JOIN "Users" up ON doc."uploadedBy" = up."UserID"
        WHERE ($1::int IS NULL OR d."CompanyID" = $1)
        GROUP BY d."departmentID", d."departmentName"
        ORDER BY d."departmentName"
    `, [companyID]);

    const scopedRows = await pool.query(`
        SELECT COUNT(doc."documentID")::int AS count
        FROM "Document" doc
        LEFT JOIN "Users" up ON doc."uploadedBy" = up."UserID"
        WHERE ($1::int IS NULL OR up."CompanyID" = $1)
    `, [companyID]);

    const totalDocuments = parseInt(scopedRows.rows[0].count);

    return result.rows.map(row => ({
        ...row,
        documentCount: parseInt(row.documentCount),
        percentage: totalDocuments > 0 ? Math.round((parseInt(row.documentCount) / totalDocuments) * 100) : 0
    }));
}

export async function createDepartment(name, companyID = null) {
    const pool = await getPool();

    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Department"
         WHERE "departmentName" = $1 AND "CompanyID" IS NOT DISTINCT FROM $2`,
        [name, companyID]
    );

    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Department name already exists");
    }

    const result = await pool.query(
        `INSERT INTO "Department" ("departmentName", "CompanyID") VALUES ($1, $2) RETURNING "departmentID" AS id`,
        [name, companyID]
    );

    return result.rows[0].id;
}

export async function deleteDepartment(departmentId, companyID = null) {
    const pool = await getPool();

    const ownerCheck = await pool.query(
        `SELECT "departmentID" FROM "Department"
         WHERE "departmentID" = $1 AND "CompanyID" IS NOT DISTINCT FROM $2`,
        [departmentId, companyID]
    );

    if (ownerCheck.rows.length === 0) {
        throw new Error("Department not found");
    }

    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Document" WHERE "departmentID" = $1`,
        [departmentId]
    );

    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Cannot delete department: it is used by existing documents");
    }

    await pool.query(
        `DELETE FROM "Department" WHERE "departmentID" = $1`,
        [departmentId]
    );

    return true;
}
