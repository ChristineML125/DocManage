import {getPool} from "../config/db.js";

export async function getDepartmentLoad() {
    const pool = await getPool();
    const result = await pool.query(`
        SELECT 
            d."departmentID" AS id,
            d."departmentName" AS "departmentName",
            COUNT(doc."documentID") AS "documentCount"
        FROM "Department" d
        LEFT JOIN "Document" doc ON d."departmentID" = doc."departmentID"
        GROUP BY d."departmentID", d."departmentName"
        ORDER BY d."departmentName"
    `);

    const totalDocuments = result.rows.reduce((sum,row)=> sum + parseInt(row.documentCount), 0);
    
    return result.rows.map(row => ({
        ...row,
        documentCount: parseInt(row.documentCount),
        percentage: totalDocuments > 0 ? Math.round((parseInt(row.documentCount) / totalDocuments) * 100) : 0
    }));
}

export async function createDepartment(name) {
    const pool = await getPool();
    
    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Department" WHERE "departmentName" = $1`,
        [name]
    );
    
    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Department name already exists");
    }
    
    const result = await pool.query(
        `INSERT INTO "Department" ("departmentName") VALUES ($1) RETURNING "departmentID" AS id`,
        [name]
    );
    
    return result.rows[0].id;
}

export async function deleteDepartment(departmentId) {
    const pool = await getPool();
    
    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Document" WHERE "departmentID" = $1`,
        [departmentId]
    );
    
    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Cannot delete department: it is used by existing documents");
    }
    
    const result = await pool.query(
        `DELETE FROM "Department" WHERE "departmentID" = $1`,
        [departmentId]
    );
    
    if (result.rowCount === 0) {
        throw new Error("Department not found");
    }
    
    return true;
}
