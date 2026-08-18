import express from 'express';
import { upload } from '../middleware/upload.js';
import path from "path";
import {
  convertDocxToPdf,
  convertPdfToDocx,
  convertXlsxToPdf,
  convertDocxToXlsx,
  convertPdfToXlSX
} from "../utils/convert.js";
import { generateSummary as generateAISummary } from '../services/aiService.js';
import {
  uploadDocument,
  addNewVersion,
  deleteDocument,
  listDocuments,
  getDocument,
  updateDocumentStatus,
  previewDocument,
  getCountDoc,
  setLatestVersion
} from '../services/documentService.js';
import { authenticate } from '../middleware/auth.js';
import { getPool } from '../config/db.js';

import { isConfigured, uploadFile, deleteFile, getPublicUrl } from '../config/storage.js';
import { generateUniqueFilename } from '../middleware/upload.js';

const router = express.Router();

router.get("/count", authenticate, async(req,res)=>{
    try{
        const data = await getCountDoc();
        if (!data) throw new Error('No data returned from database');
        console.log('Stats data:', data);
        res.json({
            success:true,
            totalDocument: data.totalDocument,
            category: data.category,
            activeCount: data.activeCount,
            archivedCount: data.archivedCount
        });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.get('/list', authenticate, async (req, res) => {
  try {
    const documents = await listDocuments({
      keyword: req.query.keyword,
      departmentId: req.query.departmentId,
      categoryId: req.query.categoryId,
      branchId: req.query.branchId
    });
    return res.json({ success: true, documents });
  } catch (err) {
    console.error('Get document list failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:documentID/summary', authenticate, async (req, res) => {
  try {
    const documentID = parseInt(req.params.documentID, 10);
    const pool = await getPool();
    const result = await pool.query(
      `SELECT "SummaryText", "GenerateAT" FROM "AISummary" WHERE "documentID" = $1`,
      [documentID]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, summary: null });
    }
    return res.json({
      success: true,
      summary: result.rows[0].SummaryText,
      generateAt: result.rows[0].GenerateAT
    });
  } catch (err) {
    console.error("Get summary failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:documentID/generate-summary', authenticate, async (req, res) => {
  try {
    const documentID = parseInt(req.params.documentID, 10);
    const pool = await getPool();
    const result = await pool.query(
      `SELECT "filePath" FROM "Document" WHERE "documentID" = $1`,
      [documentID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = result.rows[0].filePath;
    const summary = await generateAISummary(filePath);
    if (!summary) {
      return res.status(500).json({ success: false, message: "AI generation failed" });
    }

    await pool.query(`
      INSERT INTO "AISummary" ("documentID", "SummaryText", "GenerateAT")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("documentID")
      DO UPDATE SET "SummaryText" = $2, "GenerateAT" = NOW()
    `, [documentID, summary]);

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("Generate summary failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

console.log("VERSION ROUTE REGISTERED");

router.get('/:id/versions', authenticate, async (req, res) => {
  const documentID = parseInt(req.params.id, 10);
  try {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT dv."VersionNum", dv."uploadDate", dv."filePath", dv."isLatest", dv."uploadedBy", u."UserName"
      FROM "DocumentVersion" dv
      LEFT JOIN "Users" u ON dv."uploadedBy" = u."UserID"
      WHERE "DocumentID" = $1
      ORDER BY dv."VersionNum" DESC
    `, [documentID]);
    res.json({ success: true, versions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/version", authenticate, upload.single("file"), async (req, res) => {
  try {
    const documentID = Number(req.params.id);
    if (Number.isNaN(documentID)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let filename;
    if (isConfigured()) {
      filename = generateUniqueFilename(req.file.originalname);
      await uploadFile(req.file.buffer, filename, req.file.mimetype);
    } else {
      const fs = await import('fs');
      const storagePath = (await import('path')).join(process.cwd(), '..', 'storage');
      if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });
      filename = generateUniqueFilename(req.file.originalname);
      fs.writeFileSync((await import('path')).join(storagePath, filename), req.file.buffer);
    }

    const result = await addNewVersion({
      documentID,
      filePath: filename,
      uploadedBy: req.user.UserID
    });

    return res.status(201).json({
      success: true,
      message: `Version ${result.versionNum} uploaded successfully`,
      versionNum: result.versionNum,
      document: result
    });

  } catch (err) {
    console.error("Upload new version failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id/versions", authenticate, async (req, res) => {
  try {
    const documentID = Number(req.params.id);
    const { versionNum } = req.body;

    if (Number.isNaN(documentID)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }
    if (versionNum === undefined || versionNum === null) {
      return res.status(400).json({ success: false, message: "Version number required" });
    }

    const result = await setLatestVersion(documentID, Number(versionNum), req.user.UserID);

    return res.json({
      success: true,
      message: `Version ${versionNum} is now the current version`,
      document: result
    });

  } catch (err) {
    console.error("Change current version failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:documentID', authenticate, async (req, res) => {
  try {
    const documentID = parseInt(req.params.documentID, 10);
    if (isNaN(documentID)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await getDocument(documentID);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:documentID", authenticate, async (req, res) => {
  const documentID = parseInt(req.params.documentID, 10);
  if (Number.isNaN(documentID)) {
    return res.status(400).json({ success: false, message: "Invalid document ID" });
  }
  try {
    await deleteDocument(documentID, req.user.UserID);
    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/export', authenticate, async (req, res) => {
  try {
    const { documentID } = req.body;
    if (!documentID) {
      return res.status(400).json({ success: false, message: "Document ID required" });
    }
    const doc = await getDocument(documentID);
    if (!doc) return res.status(404).json({ success: false, message: "Document Not Found" });

    const filename = doc.filePath;
    const ext = path.extname(filename).toLowerCase();
    let pdfFile;

    if (ext === ".pdf") {
      pdfFile = filename;
    } else if (ext === ".docx") {
      pdfFile = await convertDocxToPdf(filename);
    } else if (ext === ".xlsx") {
      pdfFile = await convertXlsxToPdf(filename);
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    if (!pdfFile) {
      pdfFile = filename;
    }
    const downloadUrl = `/files/${pdfFile}?download=1&name=${encodeURIComponent(doc.documentName + '.pdf')}`;
    return res.json({ success: true, documentName: doc.documentName, downloadUrl });
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/export-docx', authenticate, async (req, res) => {
  try {
    const { documentID } = req.body;
    if (!documentID) return res.status(400).json({ success: false, message: "Document ID required" });

    const doc = await getDocument(documentID);
    if (!doc) return res.status(404).json({ success: false, message: "Document Not Found" });

    const filename = doc.filePath;
    const ext = path.extname(filename).toLowerCase();
    let docxName;

    if (ext === ".docx") {
      docxName = filename;
    } else if (ext === ".pdf") {
      docxName = await convertPdfToDocx(filename);
    } else if (ext === ".xlsx") {
      docxName = await convertDocxToXlsx(filename);
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    if (!docxName) {
      docxName = filename;
    }
    const downloadUrl = `/files/${docxName}?download=1&name=${encodeURIComponent(doc.documentName + '.docx')}`;
    return res.json({ success: true, documentName: doc.documentName, downloadUrl });
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/export-xlsx', authenticate, async (req, res) => {
  try {
    const { documentID } = req.body;
    if (!documentID) return res.status(400).json({ success: false, message: "Document ID required" });

    const doc = await getDocument(documentID);
    if (!doc) return res.status(404).json({ success: false, message: "Document Not Found" });

    const filename = doc.filePath;
    const ext = path.extname(filename).toLowerCase();
    let xlsxFile;

    if (ext === ".xlsx") {
      xlsxFile = filename;
    } else if (ext === ".docx") {
      xlsxFile = await convertDocxToXlsx(filename);
    } else if (ext === ".pdf") {
      xlsxFile = await convertPdfToXlSX(filename);
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    if (!xlsxFile) {
      xlsxFile = filename;
    }
    const downloadUrl = `/files/${xlsxFile}?download=1&name=${encodeURIComponent(doc.documentName + '.xlsx')}`;
    return res.json({ success: true, documentName: doc.documentName, downloadUrl });
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/upload", authenticate, upload.single('file'), async (req, res) => {
  try {
    const {
      categoryId, categoriesID,
      departmentId, departmentID,
      branchId, branchID
    } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let filename;
    if (isConfigured()) {
      filename = generateUniqueFilename(file.originalname);
      await uploadFile(file.buffer, filename, file.mimetype);
    } else {
      const fs = await import('fs');
      const storagePath = (await import('path')).join(process.cwd(), '..', 'storage');
      if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath, { recursive: true });
      filename = generateUniqueFilename(file.originalname);
      fs.writeFileSync((await import('path')).join(storagePath, filename), file.buffer);
    }

    const parsedCategoryId = parseInt(categoryId ?? categoriesID, 10);
    const parsedDepartmentId = parseInt(departmentId ?? departmentID, 10);
    const parsedBranchId = parseInt(branchId ?? branchID ?? 1, 10);
    const statusId = 1;

    const result = await uploadDocument({
      originalname: file.originalname,
      filename: filename,
      categoryId: parsedCategoryId,
      departmentId: parsedDepartmentId,
      branchId: parsedBranchId,
      uploadedById: req.user.UserID,
      statusId
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      id: result.id,
      filePath: result.filePath
    });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id/status", authenticate, async (req, res) => {
    try {
        const documentID = Number(req.params.id);
        const { statusName } = req.body;
        const userID = req.user.UserID;

        if (!statusName) {
            return res.status(400).json({ success:false, message:"Status required" });
        }

        const result = await updateDocumentStatus(documentID, statusName, userID);
        res.json(result);
    } catch(err){
        console.error("Update status failed:", err);
        res.status(500).json({ success:false, message:err.message });
    }
});

router.post("/:id/preview", authenticate, async(req,res)=>{
    try {
       console.log("PREVIEW ROUTE HIT");
        console.log("USER:", req.user);
        const documentID = Number(req.params.id);
        const result = await previewDocument(documentID, req.user.UserID);
        res.json(result);
    }catch(err){
        console.error(err);
        res.status(500).json({ success:false, message:err.message });
    }
});

export default router;
