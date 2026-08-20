import { getPool } from "../config/db.js";

export async function listCategories() {
    const pool = await getPool();
    const result = await pool.query(`
        SELECT 
            c."categoriesID" AS id, 
            c."categoriesName" AS name,
            COUNT(d."documentID")::int AS "docCount",
            COALESCE(c."description", '') AS description
        FROM "Category" c
        LEFT JOIN "Document" d ON c."categoriesID" = d."categoriesID"
        GROUP BY c."categoriesID", c."categoriesName", c."description"
        ORDER BY c."categoriesName"
    `);
    return result.rows;
}

export async function getCategory(categoryID) {
    const pool = await getPool();
    const result = await pool.query(
        `SELECT "categoriesID" AS id, "categoriesName" AS name, COALESCE("description", '') AS description FROM "Category" WHERE "categoriesID" = $1`,
        [categoryID]
    );
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

export async function createCategory(name, description = '') {
    const pool = await getPool();
    
    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Category" WHERE "categoriesName" = $1`,
        [name]
    );
    
    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Category name already exists");
    }
    
    const result = await pool.query(
        `INSERT INTO "Category" ("categoriesName", "description") VALUES ($1, $2) RETURNING "categoriesID" AS id`,
        [name, description]
    );
    
    return result.rows[0].id;
}

export async function updateCategory(categoryId, name, description = '') {
    const pool = await getPool();
    
    const existing = await getCategory(categoryId);
    if (!existing) {
        throw new Error("Category not found");
    }
    
    const check = await pool.query(
        `SELECT COUNT(*) AS count FROM "Category" WHERE "categoriesName" = $1 AND "categoriesID" != $2`,
        [name, categoryId]
    );
    
    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Category name already exists");
    }
    
    await pool.query(
        `UPDATE "Category" SET "categoriesName" = $1, "description" = $2 WHERE "categoriesID" = $3`,
        [name, description, categoryId]
    );
    
    return await getCategory(categoryId);
}

export async function deleteCategory(categoryId) {
    const pool = await getPool();
    
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
    
    if (result.rowCount === 0) {
        throw new Error("Category not found");
    }
    
    return true;
}
