import {getPool, sql} from "../config/db.js";

export async function getDepartmentLoad() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT 
            d.departmentID AS id,
            d.departmentName AS departmentName,
            COUNT(doc.documentID) AS documentCount
        FROM Department d
        LEFT JOIN Document doc ON d.departmentID = doc.departmentID
        GROUP BY d.departmentID, d.departmentName
        ORDER BY d.departmentName
    `);

    const totalDocuments = result.recordset.reduce((sum,row)=> sum + row.documentCount, 0);
    
    return result.recordset.map(row => ({
        ...row,
        percentage: totalDocuments > 0 ? Math.round((row.documentCount / totalDocuments) * 100) : 0
    }));
}

export async function createDepartment(name) {
    const pool = await getPool();
    
    const check = await pool.request()
        .input("name", sql.NVarChar(100), name)
        .query(`SELECT COUNT(*) AS count FROM dbo.Department WHERE departmentName = @name`);
    
    if (check.recordset[0].count > 0) {
        throw new Error("Department name already exists");
    }
    
    const result = await pool.request()
        .input("name", sql.NVarChar(100), name)
        .query(`
            INSERT INTO dbo.Department (departmentName) 
            OUTPUT INSERTED.departmentID AS id 
            VALUES (@name)
        `);
    
    return result.recordset[0].id;
}

export async function deleteDepartment(departmentId) {
    const pool = await getPool();
    
    const check = await pool.request()
        .input("departmentId", sql.Int, departmentId)
        .query(`SELECT COUNT(*) AS count FROM dbo.Document WHERE departmentId = @departmentId`);
    
    if (check.recordset[0].count > 0) {
        throw new Error("Cannot delete department: it is used by existing documents");
    }
    
    const result = await pool.request()
        .input("departmentId", sql.Int, departmentId)
        .query(`DELETE FROM dbo.Department WHERE departmentId = @departmentId`);
    
    if (result.rowsAffected[0] === 0) {
        throw new Error("Department not found");
    }
    
    return true;
}