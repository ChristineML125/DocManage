import { getPool, sql } from "../config/db.js";
import { generateSummary } from "./aiService.js";
import { addAuditLog } from "./auditLogsService.js";
import path from "path";
import {
  convertDocxToPdf,
  convertXlsxToPdf,
} from "../utils/convert.js";

console.log(">>> documentService.js loaded");

// ---------- Helper ----------
function cleanLike(str) {
  if (!str) return null;
  return str.replace(/[%_]/g, '\\$&');
}

// ---------- Queries ----------

/**
 * List documents with optional keyword filter.
 * Returns EXACTLY the same field names as the original route.
 */
export async function listDocuments(filters = {}) {
  const pool = await getPool();
  const request = pool.request()
    .input("keyword", sql.NVarChar(200), cleanLike(filters.keyword))
    .input("departmentId", sql.Int, filters.departmentId ? Number(filters.departmentId) : null)
    .input("categoryId", sql.Int, filters.categoryId ? Number(filters.categoryId) : null)
    .input("branchId", sql.Int, filters.branchId ? Number(filters.branchId) : null);

  // Fixed: use the pre-configured request object
  const result = await request.query(`
    SELECT
      d.documentID,
      d.documentName,
      dept.departmentName,
      c.categoriesName,
      d.uploadDate,
      d.filePath,
      s.statusName,
      dv.versionNum
    FROM Document d
    LEFT JOIN Department dept ON d.departmentID = dept.departmentID
    LEFT JOIN Category c ON d.categoriesID = c.categoriesID
    LEFT JOIN Status s ON d.statusID = s.statusID
    LEFT JOIN DocumentVersion dv ON d.documentID = dv.documentID AND dv.filePath = d.filePath
    WHERE 1=1
      AND (@keyword IS NULL OR d.documentName LIKE '%' + @keyword + '%' OR c.categoriesName LIKE '%' + @keyword + '%')
      AND (@departmentId IS NULL OR d.departmentID = @departmentId)
      AND (@categoryId IS NULL OR d.categoriesID = @categoryId)
      AND (@branchId IS NULL OR d.branchID = @branchId)
    ORDER BY d.uploadDate DESC
  `);

  return result.recordset;
}

/**
 * Get a single document by ID.
 * Returns EXACTLY the same field names as the original route.
 */
export async function getDocument(documentID) {

  const pool = await getPool();

  const result = await pool.request()
    .input("documentID", sql.Int, documentID)
    .query(`
      SELECT
        d.documentID,
        d.documentName,

        dv.filePath,
        dv.VersionID,
        dv.VersionNum,
        dv.IsLatest,

        dept.departmentName,
        c.categoriesName,
        d.uploadDate,
        d.uploadedBy,
        s.statusName,
        d.pdfPath,
        d.previewPath

      FROM Document d

      LEFT JOIN DocumentVersion dv
        ON d.documentID = dv.DocumentID
        AND dv.IsLatest = 1

      LEFT JOIN Department dept
        ON d.departmentID = dept.departmentID

      LEFT JOIN Category c
        ON d.categoriesID = c.categoriesID

      LEFT JOIN Status s
        ON d.statusID = s.statusID

      WHERE d.documentID = @documentID
    `);

  const document = result.recordset[0];

  if (!document) return null;

  return {
    ...document,
    fileUrl: document.filePath
      ? `/files/${document.filePath}`
      : null
  };
}

// ---------- Upload new document (with transaction) ----------

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

  // Generate PDF preview
  let pdfPath = null;
  if (ext === ".pdf") {
    pdfPath = filename;
  } else if (ext === ".docx") {
    pdfPath = await convertDocxToPdf(filename);
  } else if (ext === ".xlsx") {
    pdfPath = await convertXlsxToPdf(filename);
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    // Insert main document record
    const docResult = await new sql.Request(transaction)
      .input("documentName", sql.NVarChar(255), documentName)
      .input("categoryId", sql.Int, categoryId)
      .input("departmentId", sql.Int, departmentId)
      .input("branchId", sql.Int, branchId)
      .input("uploadedById", sql.Int, uploadedById)
      .input("statusId", sql.Int, statusId)
      .input("filePath", sql.NVarChar(500), filename)
      .input("pdfPath", sql.NVarChar(500), pdfPath)
      .query(`
        INSERT INTO Document (
          documentName,
          categoriesID,
          departmentID,
          branchID,
          uploadedBy,
          statusID,
          filePath,
          pdfPath,
          uploadDate
        ) VALUES (
          @documentName,
          @categoryId,
          @departmentId,
          @branchId,
          @uploadedById,
          @statusId,
          @filePath,
          @pdfPath,
          GETDATE()
        );
        SELECT SCOPE_IDENTITY() AS id;
      `);
    const newDocId = docResult.recordset[0].id;

    // Insert initial version
    await new sql.Request(transaction)
      .input("documentID", sql.Int, newDocId)
      .input("versionNum", sql.Int, 1)
      .input("uploadedById", sql.Int, uploadedById)
      .input("filePath", sql.NVarChar(500), filename)
      .query(`
        INSERT INTO DocumentVersion (
          documentID,
          versionNum,
          uploadedBy,
          filePath,
          uploadDate,
          isLatest
        ) VALUES (
          @documentID,
          1,
          @uploadedById,
          @filePath,
          GETDATE(),
          1
        );
      `);

    await transaction.commit();

    // Audit log (outside transaction to avoid rolling back on log failure)
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
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  }
}

// ---------- Add new version (with transaction and PDF conversion) ----------

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
  const transaction = new sql.Transaction(pool);

  try {

    await transaction.begin();

    // 1. Get next version number
    const versionResult = await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .query(`
        SELECT ISNULL(MAX(VersionNum), 0) + 1 AS VersionNum
        FROM DocumentVersion
        WHERE DocumentID = @documentID
      `);

    const versionNum = versionResult.recordset[0].VersionNum;

    // 2. Old current version -> not current
    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .query(`
        UPDATE DocumentVersion
        SET IsLatest = 0
        WHERE DocumentID = @documentID
      `);

    // 3. Insert new version
    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("versionNum", sql.Int, versionNum)
      .input("filePath", sql.NVarChar(500), filePath)
      .input("uploadedBy", sql.Int, uploadedBy)
      .query(`
        INSERT INTO DocumentVersion (
          DocumentID,
          VersionNum,
          UploadDate,
          FilePath,
          UploadedBy,
          IsLatest
        )
        VALUES (
          @documentID,
          @versionNum,
          GETDATE(),
          @filePath,
          @uploadedBy,
          1
        )
      `);

    // 4. Update main Document
    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("filePath", sql.NVarChar(500), filePath)
      .input("pdfPath", sql.NVarChar(500), pdfPath)
      .query(`
        UPDATE Document
        SET
          FilePath = @filePath,
          PdfPath = @pdfPath,
          UploadDate = GETDATE()
        WHERE DocumentID = @documentID
      `);

    await transaction.commit();

    // 5. Audit
    await addAuditLog({
      userID: uploadedBy,
      action: "Add Document Version",
      targetEntity: "Document",
      targetID: documentID,
      documentID: documentID,
      description: `Added version ${versionNum} for document ${documentID}`
    });

    return {
      documentID,
      versionNum,
      filePath,
      pdfPath
    };

  } catch (error) {

    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  }
}

// ---------- Delete document ----------

export async function deleteDocument(documentID, deleteBy) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  //get the delete name
  const docResult = await pool.request()
      .input("documentID", sql.Int, documentID)
      .query(`
          SELECT documentName
          FROM Document
          WHERE documentID=@documentID
      `);

  const documentName = docResult.recordset[0]?.documentName;


  await transaction.begin();

  try {
    // Safely delete from UsersDocument if the table exists
    await transaction.request()
      .input("documentID", sql.Int, documentID)
      .query(`
        IF OBJECT_ID('dbo.UsersDocument', 'U') IS NOT NULL
          DELETE FROM UsersDocument WHERE documentID = @documentID;
      `);

    // AI summaries (table should exist; if not, it will throw – better to know)
    await transaction.request()
      .input("documentID", sql.Int, documentID)
      .query(`DELETE FROM AISummary WHERE documentID = @documentID`);

    // All versions
    await transaction.request()
      .input("documentID", sql.Int, documentID)
      .query(`DELETE FROM DocumentVersion WHERE documentID = @documentID`);

    // Main document
    const result = await transaction.request()
      .input("documentID", sql.Int, documentID)
      .query(`DELETE FROM Document WHERE documentID = @documentID`);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Document not found");
    }

    await transaction.commit();

    // Audit log after successful delete
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
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  }
}

// ---------- Upload new version with AI summary (backward compatible) ----------

export async function uploadNewVersion(payload) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const documentId = payload.documentId;
    const nextVersion = await new sql.Request(transaction)
      .input("documentId", sql.Int, payload.documentId)
      .query(`
        SELECT ISNULL(MAX(VersionNumber), 0) + 1 AS VersionNumber
        FROM dbo.DocumentVersion
        WHERE DocumentId = @documentId;
      `);
    const versionNumber = nextVersion.recordset[0].VersionNumber;

    await new sql.Request(transaction)
      .input("documentId", sql.Int, payload.documentId)
      .query(`UPDATE dbo.DocumentVersion SET IsLatest = 0 WHERE DocumentId = @documentId;`);

    await new sql.Request(transaction)
      .input("documentId", sql.Int, payload.documentId)
      .input("versionNum", sql.Int, versionNumber)
      .input("filePath", sql.NVarChar(255), payload.filePath)
      .input("uploadedById", sql.Int, payload.uploadedById)
      .query(`
        INSERT INTO dbo.DocumentVersion (
          DocumentId, VersionNumber, filePath, IsLatest, UploadedBy
        ) VALUES (
          @documentId, @versionNum, @filePath, 1, @uploadedById
        );
      `);

    const summary = await generateSummary(payload.filePath);
    await new sql.Request(transaction)
      .input("documentId", sql.Int, payload.documentId)
      .input("summaryText", sql.VarChar(sql.Max), summary)
      .query(`UPDATE dbo.AISummary SET summaryText = @summaryText WHERE documentId = @documentId;`);

    await transaction.commit();

    await addAuditLog({
      userID: payload.uploadedById,
      action: "Update Document",
      targetEntity: documentName,
      targetID: documentId,
      documentID: documentId,
      description: `Updated document ${documentId}`
    });

    return getDocument(documentId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ---------- Set latest version ----------

// ---------- Set latest/current version ----------

export async function setLatestVersion(documentID, versionNum, userID) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {

    // 1. Find selected version
    const check = await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("versionNum", sql.Int, versionNum)
      .query(`
        SELECT
          VersionID,
          VersionNum,
          filePath
        FROM dbo.DocumentVersion
        WHERE DocumentID = @documentID
          AND VersionNum = @versionNum
      `);

    if (check.recordset.length === 0) {
      throw new Error("Version not found for this document");
    }

    const selectedVersion = check.recordset[0];

    // 2. Set all versions to not latest
    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .query(`
        UPDATE dbo.DocumentVersion
        SET IsLatest = 0
        WHERE DocumentID = @documentID
      `);

    // 3. Set selected version as latest
    const result = await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("versionNum", sql.Int, versionNum)
      .query(`
        UPDATE dbo.DocumentVersion
        SET IsLatest = 1
        WHERE DocumentID = @documentID
          AND VersionNum = @versionNum
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Failed to update current version");
    }

    // 4. IMPORTANT:
    // Update main Document to point to the selected version
    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("filePath", sql.NVarChar(500), selectedVersion.filePath)
      .query(`
        UPDATE Document
        SET filePath = @filePath
        WHERE documentID = @documentID
      `);

    // 5. Update pdfPath according to selected version
    const ext = path.extname(selectedVersion.filePath).toLowerCase();

    let pdfPath = null;

    if (ext === ".pdf") {
      pdfPath = selectedVersion.filePath;
    } else if (ext === ".docx") {
      pdfPath = await convertDocxToPdf(selectedVersion.filePath);
    } else if (ext === ".xlsx") {
      pdfPath = await convertXlsxToPdf(selectedVersion.filePath);
    }

    await new sql.Request(transaction)
      .input("documentID", sql.Int, documentID)
      .input("pdfPath", sql.NVarChar(500), pdfPath)
      .query(`
        UPDATE Document
        SET pdfPath = @pdfPath
        WHERE documentID = @documentID
      `);

    await transaction.commit();

    // 6. Audit log
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

    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  }
}

export async function updateDocumentStatus(documentID, statusName, userID) {
    const pool = await getPool();

    const result = await pool.request()
        .input("documentID", sql.Int, documentID)
        .input("statusName", sql.NVarChar(50), statusName)
        .query(`
            UPDATE Document
            SET statusID = (
                SELECT statusID
                FROM Status
                WHERE statusName = @statusName
            )
            WHERE documentID = @documentID
        `);

      await addAuditLog({
        userID: userID,
        action:"Update Document Status",
        targetEntity:"Document",
        targetID:documentID,
        documentID:documentID,
        description:`Change status to ${statusName}`
      });

    if (result.rowsAffected[0] === 0) {
        return {
            success: false,
            message: "Document not found"
        };
    }

    return {
        success: true,
        message: "Status updated"
    };
}

export async function previewDocument(documentID, userID) {

    const pool = await getPool();

    const result = await pool.request()
        .input("documentID", sql.Int, documentID)
        .query(`
            SELECT TOP 1
                d.documentID,
                d.documentName,
                dv.VersionID,
                dv.VersionNum,
                dv.filePath,
                dv.IsLatest
            FROM Document d
            INNER JOIN DocumentVersion dv
                ON d.documentID = dv.DocumentID
            WHERE d.documentID = @documentID
              AND dv.IsLatest = 1
        `);

    const document = result.recordset[0];

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

    const result = await pool.request()
    .query(`
        SELECT
          (SELECT COUNT(*) FROM Document) AS totalDocument,
          (SELECT COUNT(DISTINCT departmentID) FROM Document) AS department,
          (SELECT COUNT(DISTINCT categoriesID) FROM Document) AS category,
          (SELECT COUNT(*) FROM Document d
            INNER JOIN Status s ON d.statusID = s.statusID
            WHERE s.statusName = 'Active') AS activeCount,
          (SELECT COUNT(*) FROM Document d
            INNER JOIN Status s ON d.statusID = s.statusID
            WHERE s.statusName = 'Archived') AS archivedCount
    `);


    return result.recordset[0];
}