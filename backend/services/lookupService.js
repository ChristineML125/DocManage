import {getPool} from "../config/db.js";

export async function getAllLookup() {
    const pool = await getPool();

    const category = await pool.query(`SELECT "categoriesID" AS id, "categoriesName" AS name FROM "Category" ORDER BY "categoriesName"`);
    const department = await pool.query(`SELECT "departmentID" AS id, "departmentName" AS name FROM "Department" ORDER BY "departmentName"`);
    const branch = await pool.query(`SELECT "branchID" AS id, "branchName" AS name FROM "Branch" ORDER BY "branchName"`);
    const status = await pool.query(`SELECT "statusID" AS id, "statusName" AS name FROM "Status" ORDER BY "statusName"`);
    const users = await pool.query(`SELECT "UserID" AS id, "UserName" AS name FROM "Users" ORDER BY "UserName"`);

    return {
        categories: category.rows,
        departments: department.rows,
        branches: branch.rows,
        statuses: status.rows,
        category: category.rows,
        department: department.rows,
        branch: branch.rows,
        status: status.rows,
        users: users.rows
    };
}
