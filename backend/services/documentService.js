import { getPool } from "../config/db.js";
import { generateSummary } from "./aiService.js";
import { addAuditLog } from "./auditLogsService.js";
import path from "path";
import {
  convertDocxToPdf,
  convertXlsxToPdf,
} from "../utils/convert.js";

console.log(">>> documentService.js loaded");

function cleanLike(str) {
  if (!str) return null;
  return str.replace(/[%_]/g, '\\$&');
}

export async function listDocuments(filters = {}) {
  const pool = await getPool();
  const keyword = cleanLike(filters.keyword);
  const departmentId = filters.departmentId ? Number(filters.departmentId) : null;
  const categoryId = filters.categoryId ? Number(filters.categoryId) : null;
  const branchId = filters.branchId ? Number(filters.branchId) : null;

  const result = await pool.query(`
    SELECT
      d."documentID",
      d."documentName",
      dept."departmentName",
      c."categoriesName",
      d."uploadDate",
      d."filePath",
      s."statusName",
      dv."VersionNum"
    FROM "Document" d
    LEFT JOIN "Department" dept ON d."departmentID" = dept."departmentID"
    LEFT JOIN "Category" c ON d."categoriesID" = c."categoriesID"
    LEFT JOIN "Status" s ON d."statusID" = s."statusID"
    LEFT JOIN "DocumentVersion" dv ON d."documentID" = dv."DocumentID" AND dv."filePath" = d."filePath"
    LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID"
    WHERE 1=1
      AND (u."userType" IS NULL OR u."userType" = 'company')
      AND ($1::text IS NULL OR d."documentName" LIKE '%' || $1 || '%' OR c."categoriesName" LIKE '%' || $1 || '%')
      AND ($2::int IS NULL OR d."departmentID" = $2)
      AND ($3::int IS NULL OR d."categoriesID" = $3)
      AND ($4::int IS NULL OR d."branchID" = $4)
    ORDER BY d."uploadDate" DESC
  `, [keyword, departmentId, categoryId, branchId]);

  return result.rows;
}

export async function getDocument(documentID) {
  const pool = await getPool();

  const result = await pool.query(`
    SELECT
      d."documentID",
      d."documentName",
      dv."filePath",
      dv."VersionID",
      dv."VersionNum",
      dv."isLatest",
      dept."departmentName",
      c."categoriesName",
      d."uploadDate",
      d."uploadedBy",
      s."statusName",
      d."pdfPath",
      d."previewPath"
    FROM "Document" d
    LEFT JOIN "DocumentVersion" dv
      ON d."documentID" = dv."DocumentID"
      AND dv."isLatest" = true
    LEFT JOIN "Department" dept
      ON d."departmentID" = dept."departmentID"
    LEFT JOIN "Category" c
      ON d."categoriesID" = c."categoriesID"
    LEFT JOIN "Status" s
      ON d."statusID" = s."statusID"
    WHERE d."documentID" = $1
  `, [documentID]);

  const document = result.rows[0];
  if (!document) return null;

  return {
    ...document,
    fileUrl: document.filePath
      ? `/files/${document.filePath}`
      : null
  };
}

export async function uploadDocument({
  originalname,
  filename,
  categoryId,
  departmentId,
  branchId,
  uploadedById,
  statusId
}) {
  const ext = path.extname(filename).toLowerCase();
  const documentName = path.parse(originalname).name;

  let pdfPath = null;
  if (ext === ".pdf") {
    pdfPath = filename;
  } else if (ext === ".docx") {
    pdfPath = await convertDocxToPdf(filename);
  } else if (ext === ".xlsx") {
    pdfPath = await convertXlsxToPdf(filename);
  }

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const docResult = await client.query(`
      INSERT INTO "Document" (
        "documentName",
        "categoriesID",
        "departmentID",
        "branchID",
        "uploadedBy",
        "statusID",
        "filePath",
        "pdfPath",
        "uploadDate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING "documentID" AS id
    `,
    [documentName, categoryId, departmentId, branchId, uploadedById, statusId, filename, pdfPath]);

    const newDocId = docResult.rows[0].id;

    await client.query(`
      INSERT INTO "DocumentVersion" (
        "DocumentID",
        "VersionNum",
        "uploadedBy",
        "filePath",
        "uploadDate",
        "isLatest"
      ) VALUES ($1, 1, $2, $3, NOW(), true)
    `,
    [newDocId, uploadedById, filename]);

    await client.query('COMMIT');

    await addAuditLog({
      userID: uploadedById,
      action: "Upload Document",
      targetEntity: "Document",
      targetID: newDocId,
      documentID: newDocId,
      description: `Upload Document ${documentName}`
    });

    return { id: newDocId, filePath: filename };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function addNewVersion({
  documentID,
  filePath,
  uploadedBy
}) {

  const ext = path.extname(filePath).toLowerCase();
  let pdfPath = null;

  if (ext === ".pdf") {
    pdfPath = filePath;
  } else if (ext === ".docx") {
    pdfPath = await convertDocxToPdf(filePath);
  } else if (ext === ".xlsx") {
    pdfPath = await convertXlsxToPdf(filePath);
  }

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const versionResult = await client.query(`
      SELECT COALESCE(MAX("VersionNum"), 0) + 1 AS "VersionNum"
      FROM "DocumentVersion"
      WHERE "DocumentID" = $1
    `, [documentID]);

    const versionNum = versionResult.rows[0].VersionNum;

    await client.query(`
      UPDATE "DocumentVersion"
      SET "isLatest" = false
      WHERE "DocumentID" = $1
    `, [documentID]);

    await client.query(`
      INSERT INTO "DocumentVersion" (
        "DocumentID",
        "VersionNum",
        "uploadDate",
        "filePath",
        "uploadedBy",
        "isLatest"
      ) VALUES ($1, $2, NOW(), $3, $4, true)
    `,
    [documentID, versionNum, filePath, uploadedBy]);

    await client.query(`
      UPDATE "Document"
      SET
        "FilePath" = $1,
        "PdfPath" = $2,
        "UploadDate" = NOW()
      WHERE "DocumentID" = $3
    `,
    [filePath, pdfPath, documentID]);

    await client.query('COMMIT');

    await addAuditLog({
      userID: uploadedBy,
      action: "Add Document Version",
      targetEntity: "Document",
      targetID: documentID,
      documentID: documentID,
      description: `Added version ${versionNum} for document ${documentID}`
    });

    return { documentID, versionNum, filePath, pdfPath };

  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteDocument(documentID, deleteBy) {
  const pool = await getPool();

  const docResult = await pool.query(
    `SELECT "documentName" FROM "Document" WHERE "documentID"=$1`,
    [documentID]
  );

  const documentName = docResult.rows[0]?.documentName;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM "AISummary" WHERE "documentID" = $1`, [documentID]);
    await client.query(`DELETE FROM "DocumentVersion" WHERE "DocumentID" = $1`, [documentID]);

    const result = await client.query(`DELETE FROM "Document" WHERE "documentID" = $1`, [documentID]);

    if (result.rowCount === 0) {
      throw new Error("Document not found");
    }

    await client.query('COMMIT');

    await addAuditLog({
      userID: deleteBy,
      action: "Delete Document",
      targetEntity: documentName,
      targetID: documentID,
      documentID: documentID,
      description: `Delete Document ${documentName}`
    });

    return true;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function uploadNewVersion(payload) {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const documentId = payload.documentId;
    const nextVersion = await client.query(`
      SELECT COALESCE(MAX("VersionNum"), 0) + 1 AS "VersionNum"
      FROM "DocumentVersion"
      WHERE "DocumentID" = $1
    `, [documentId]);
    const versionNumber = nextVersion.rows[0].VersionNum;

    await client.query(`UPDATE "DocumentVersion" SET "isLatest" = false WHERE "DocumentID" = $1`, [documentId]);

    await client.query(`
      INSERT INTO "DocumentVersion" (
        "DocumentID", "VersionNum", "filePath", "isLatest", "uploadedBy"
      ) VALUES ($1, $2, $3, true, $4)
    `,
    [documentId, versionNumber, payload.filePath, payload.uploadedById]);

    const summary = await generateSummary(payload.filePath);
    await client.query(`UPDATE "AISummary" SET "summaryText" = $1 WHERE "documentID" = $2`, [summary, documentId]);

    await client.query('COMMIT');

    await addAuditLog({
      userID: payload.uploadedById,
      action: "Update Document",
      targetEntity: "Document",
      targetID: documentId,
      documentID: documentId,
      description: `Updated document ${documentId}`
    });

    return getDocument(documentId);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
    throw error;
  } finally {
    client.release();
  }
}

export async function setLatestVersion(documentID, versionNum, userID) {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const check = await client.query(`
      SELECT
        "VersionID",
        "VersionNum",
        "filePath"
      FROM "DocumentVersion"
      WHERE "DocumentID" = $1
        AND "VersionNum" = $2
    `, [documentID, versionNum]);

    if (check.rows.length === 0) {
      throw new Error("Version not found for this document");
    }

    const selectedVersion = check.rows[0];

    await client.query(`
      UPDATE "DocumentVersion"
      SET "isLatest" = false
      WHERE "DocumentID" = $1
    `, [documentID]);

    const result = await client.query(`
      UPDATE "DocumentVersion"
      SET "isLatest" = true
      WHERE "DocumentID" = $1
        AND "VersionNum" = $2
    `, [documentID, versionNum]);

    if (result.rowCount === 0) {
      throw new Error("Failed to update current version");
    }

    await client.query(`
      UPDATE "Document"
      SET "filePath" = $1
      WHERE "documentID" = $2
    `, [selectedVersion.filePath, documentID]);

    const ext = path.extname(selectedVersion.filePath).toLowerCase();
    let pdfPath = null;

    if (ext === ".pdf") {
      pdfPath = selectedVersion.filePath;
    } else if (ext === ".docx") {
      pdfPath = await convertDocxToPdf(selectedVersion.filePath);
    } else if (ext === ".xlsx") {
      pdfPath = await convertXlsxToPdf(selectedVersion.filePath);
    }

    await client.query(`
      UPDATE "Document"
      SET "pdfPath" = $1
      WHERE "documentID" = $2
    `, [pdfPath, documentID]);

    await client.query('COMMIT');

    await addAuditLog({
      userID: userID,
      action: "Change Current Version",
      targetEntity: "Document",
      targetID: documentID,
      documentID: documentID,
      description: `Changed current version to Version ${versionNum}`
    });

    return await getDocument(documentID);

  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function updateDocumentStatus(documentID, statusName, userID) {
    const pool = await getPool();

    const result = await pool.query(`
        UPDATE "Document"
        SET "statusID" = (
            SELECT "statusID"
            FROM "Status"
            WHERE "statusName" = $1
        )
        WHERE "documentID" = $2
    `, [statusName, documentID]);

      await addAuditLog({
        userID: userID,
        action:"Update Document Status",
        targetEntity:"Document",
        targetID:documentID,
        documentID:documentID,
        description:`Change status to ${statusName}`
      });

    if (result.rowCount === 0) {
        return { success: false, message: "Document not found" };
    }

    return { success: true, message: "Status updated" };
}

export async function previewDocument(documentID, userID) {

    const pool = await getPool();

    const result = await pool.query(`
        SELECT
            d."documentID",
            d."documentName",
            dv."VersionID",
            dv."VersionNum",
            dv."filePath",
            dv."isLatest"
        FROM "Document" d
        INNER JOIN "DocumentVersion" dv
            ON d."documentID" = dv."DocumentID"
        WHERE d."documentID" = $1
          AND dv."isLatest" = true
        LIMIT 1
    `, [documentID]);

    const document = result.rows[0];

    if (!document) {
        throw new Error("Current version not found");
    }

    await addAuditLog({
        userID,
        action: "Preview Document",
        targetEntity: "Document",
        targetID: documentID,
        documentID: documentID,
        description: `Preview Document ${document.documentName}`
    });

    return {
        ...document,
        fileUrl: document.filePath
            ? `/files/${document.filePath}`
            : null
    };
}

export async function getCountDoc(){

    const pool = await getPool();

    const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM "Document" d LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID" WHERE u."userType" IS NULL OR u."userType" = 'company') AS "totalDocument",
          (SELECT COUNT(DISTINCT d."departmentID") FROM "Document" d LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID" WHERE u."userType" IS NULL OR u."userType" = 'company') AS "department",
          (SELECT COUNT(DISTINCT d."categoriesID") FROM "Document" d LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID" WHERE u."userType" IS NULL OR u."userType" = 'company') AS "category",
          (SELECT COUNT(*) FROM "Document" d
            INNER JOIN "Status" s ON d."statusID" = s."statusID"
            LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID"
            WHERE s."statusName" = 'Active' AND (u."userType" IS NULL OR u."userType" = 'company')) AS "activeCount",
          (SELECT COUNT(*) FROM "Document" d
            INNER JOIN "Status" s ON d."statusID" = s."statusID"
            LEFT JOIN "Users" u ON d."uploadedBy" = u."UserID"
            WHERE s."statusName" = 'Archived' AND (u."userType" IS NULL OR u."userType" = 'company')) AS "archivedCount"
    `);

    return result.rows[0];
}
