import { getPool, sql } from "../config/db.js";

export async function listCategories() {
    const pool = await getPool();
    const result = await pool.request()
        .query(`
            SELECT 
            c.categoriesID AS id, 
            c.categoriesName AS name,
            COUNT (d.documentID) AS docCount,
            ISNULL(c.description, '') AS description
            FROM dbo.Category c
            LEFT JOIN Document d ON c.categoriesID = d.categoriesID
            GROUP BY c.categoriesID, c.categoriesName, c.description
            ORDER BY categoriesName
        `);
    return result.recordset;
}

export async function getCategory(categoryID) {
    const pool = await getPool();
    const result = await pool.request()
        .input("categoryID", sql.Int, categoryID)
        .query(`SELECT categoriesID AS id, categoriesName AS name, ISNULL(description, '') AS description FROM dbo.Category WHERE categoriesID = @categoryID`);
    
    if (result.recordset.length === 0) return null;
    return result.recordset[0];
}

export async function createCategory(name, description = '') {
    const pool = await getPool();
    
    const check = await pool.request()
        .input("name", sql.NVarChar(100), name)
        .query(`SELECT 
            COUNT(*) AS count FROM dbo.Category WHERE categoriesName = @name
            
            `);
    
    if (check.recordset[0].count > 0) {
        throw new Error("Category name already exists");
    }
    
    const result = await pool.request()
        .input("name", sql.NVarChar(100), name)
        .input("description", sql.NVarChar(255), description)
        .query(`
            INSERT INTO dbo.Category (categoriesName, description) 
            OUTPUT INSERTED.categoriesID AS id 
            VALUES (@name, @description)
        `);
    
    return result.recordset[0].id;
}

export async function updateCategory(categoryId, name, description = '') {
    const pool = await getPool();
    
    const existing = await getCategory(categoryId);
    if (!existing) {
        throw new Error("Category not found");
    }
    
    const check = await pool.request()
        .input("categoryId", sql.Int, categoryId)
        .input("name", sql.NVarChar(100), name)
        .query(`SELECT COUNT(*) AS count FROM dbo.Category WHERE categoriesName = @name AND categoriesID != @categoryId`);
    
    if (check.recordset[0].count > 0) {
        throw new Error("Category name already exists");
    }
    
    await pool.request()
        .input("categoryID", sql.Int, categoryId)
        .input("name", sql.NVarChar(100), name)
        .input("description", sql.NVarChar(255), description)
        .query(`UPDATE dbo.Category SET categoriesName = @name, description = @description WHERE categoriesID = @categoryID`);
    
    return await getCategory(categoryId);
}

export async function deleteCategory(categoryId) {
    const pool = await getPool();
    
    const check = await pool.request()
        .input("categoryId", sql.Int, categoryId)
        .query(`SELECT COUNT(*) AS count FROM dbo.Document WHERE categoriesID = @categoryId`);
    
    if (check.recordset[0].count > 0) {
        throw new Error("Cannot delete category: it is used by existing documents");
    }
    
    const result = await pool.request()
        .input("categoryId", sql.Int, categoryId)
        .query(`DELETE FROM dbo.Category WHERE categoriesID = @categoryId`);
    
    if (result.rowsAffected[0] === 0) {
        throw new Error("Category not found");
    }
    
    return true;
}
