import {getPool} from "../config/db.js";

export async function getAllLookup(companyID = null) {
    const pool = await getPool();

    const category = await pool.query(
        `SELECT "categoriesID" AS id, "categoriesName" AS name FROM "Category"
         WHERE ($1::int IS NULL OR "CompanyID" = $1) ORDER BY "categoriesName"`,
        [companyID]
    );
    const department = await pool.query(
        `SELECT "departmentID" AS id, "departmentName" AS name FROM "Department"
         WHERE ($1::int IS NULL OR "CompanyID" = $1) ORDER BY "departmentName"`,
        [companyID]
    );
    const branch = await pool.query(`SELECT "branchID" AS id, "branchName" AS name FROM "Branch" ORDER BY "branchName"`);
    const status = await pool.query(`SELECT "statusID" AS id, "statusName" AS name FROM "Status" ORDER BY "statusName"`);
    const users = await pool.query(
        `SELECT "UserID" AS id, "UserName" AS name FROM "Users"
         WHERE ("userType" IS NULL OR "userType" = 'company')
         AND ($1::int IS NULL OR "CompanyID" = $1)
         ORDER BY "UserName"`,
        [companyID]
    );

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
