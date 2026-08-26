import { getPool } from "../config/db.js";

export async function listCategories(companyID = null) {
    const pool = await getPool();
    const result = await pool.query(`
        SELECT
            c."categoriesID" AS id,
            c."categoriesName" AS name,
            COUNT(d."documentID")::int AS "docCount",
            COALESCE(c."description", '') AS description
        FROM "Category" c
        LEFT JOIN "Document" d ON c."categoriesID" = d."categoriesID"
        WHERE ($1::int IS NULL OR c."CompanyID" = $1)
        GROUP BY c."categoriesID", c."categoriesName", c."description"
        ORDER BY c."categoriesName"
    `, [companyID]);
    return result.rows;
}

export async function getCategory(categoryID, companyID = null) {
    const pool = await getPool();
    const result = await pool.query(
        `SELECT "categoriesID" AS id, "categoriesName" AS name, COALESCE("description", '') AS description
         FROM "Category"
         WHERE "categoriesID" = $1 AND ($2::int IS NULL OR "CompanyID" IS NOT DISTINCT FROM $2)`,
        [categoryID, companyID]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
}

export async function createCategory(name, description = '', companyID = null) {
    const pool = await getPool();

    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Category"
         WHERE "categoriesName" = $1 AND "CompanyID" IS NOT DISTINCT FROM $2`,
        [name, companyID]
    );

    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Category name already exists");
    }

    const result = await pool.query(
        `INSERT INTO "Category" ("categoriesName", "description", "CompanyID") VALUES ($1, $2, $3) RETURNING "categoriesID" AS id`,
        [name, description, companyID]
    );

    return result.rows[0].id;
}

export async function updateCategory(categoryId, name, description = '', companyID = null) {
    const pool = await getPool();

    const existing = await getCategory(categoryId, companyID);
    if (!existing) {
        throw new Error("Category not found");
    }

    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Category"
         WHERE "categoriesName" = $1 AND "categoriesID" != $2 AND "CompanyID" IS NOT DISTINCT FROM $3`,
        [name, categoryId, companyID]
    );

    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Category name already exists");
    }

    await pool.query(
        `UPDATE "Category" SET "categoriesName" = $1, "description" = $2 WHERE "categoriesID" = $3`,
        [name, description, categoryId]
    );

    return await getCategory(categoryId, companyID);
}

export async function deleteCategory(categoryId, companyID = null) {
    const pool = await getPool();

    const ownerCheck = await getCategory(categoryId, companyID);
    if (!ownerCheck) {
        throw new Error("Category not found");
    }

    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Document" WHERE "categoriesID" = $1`,
        [categoryId]
    );

    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Cannot delete category: it is used by existing documents");
    }

    const result = await pool.query(
        `DELETE FROM "Category" WHERE "categoriesID" = $1`,
        [categoryId]
    );

    return true;
}
