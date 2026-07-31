import {getPool} from "../config/db.js";

export async function getAllLookup() {
    const pool = await getPool();

    const category = await pool.request()
        .query(`SELECT categoriesID AS id, categoriesName AS name FROM dbo.Category ORDER BY categoriesName`);

    const department = await pool.request()
        .query(`SELECT departmentID AS id, departmentName AS name FROM dbo.Department ORDER BY departmentName`);
    
    const branch = await pool.request()
        .query(`SELECT branchID AS id, branchName AS name FROM dbo.Branch ORDER BY branchName`);

    const status = await pool.request()
        .query(`SELECT statusID AS id, statusName AS name FROM dbo.Status ORDER BY statusName`);

    const users = await pool.request()
        .query(`SELECT userID AS id, userName AS name FROM dbo.Users ORDER BY userName`);

    return {
        categories: category.recordset,
        departments: department.recordset,
        branches: branch.recordset,
        statuses: status.recordset,
        category: category.recordset,
        department: department.recordset,
        branch: branch.recordset,
        status: status.recordset,
        users: users.recordset
    };
    
}
