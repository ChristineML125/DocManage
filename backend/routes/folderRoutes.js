import express from 'express';
import { getPool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Get all folders for current user
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT f.*,
        (SELECT COUNT(*) FROM "Document" d WHERE d."folderID" = f."folderID")::int AS "docCount"
      FROM "Folder" f
      WHERE f."userID" = $1
      ORDER BY f."folderName" ASC
    `, [req.user.UserID]);

    return res.json({ success: true, folders: result.rows });
  } catch (err) {
    console.error('Get folders failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create folder
router.post('/', async (req, res) => {
  try {
    const { folderName, parentFolderID } = req.body;
    if (!folderName?.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const pool = await getPool();
    const result = await pool.query(`
      INSERT INTO "Folder" ("folderName", "parentFolderID", "userID")
      VALUES ($1, $2, $3)
      RETURNING *
    `, [folderName.trim(), parentFolderID || null, req.user.UserID]);

    return res.json({ success: true, folder: result.rows[0] });
  } catch (err) {
    console.error('Create folder failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Rename folder
router.put('/:id', async (req, res) => {
  try {
    const { folderName } = req.body;
    if (!folderName?.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const pool = await getPool();
    const result = await pool.query(`
      UPDATE "Folder" SET "folderName" = $1
      WHERE "folderID" = $2 AND "userID" = $3
      RETURNING *
    `, [folderName.trim(), req.params.id, req.user.UserID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    return res.json({ success: true, folder: result.rows[0] });
  } catch (err) {
    console.error('Rename folder failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      DELETE FROM "Folder"
      WHERE "folderID" = $1 AND "userID" = $2
      RETURNING "folderID"
    `, [req.params.id, req.user.UserID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete folder failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Move document into folder
router.post('/assign', async (req, res) => {
  try {
    const { documentID, folderID } = req.body;

    const pool = await getPool();

    // Verify ownership of both folder and document
    const folderCheck = await pool.query(
      `SELECT "folderID" FROM "Folder" WHERE "folderID" = $1 AND "userID" = $2`,
      [folderID, req.user.UserID]
    );
    if (folderCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const docCheck = await pool.query(
      `SELECT "documentID" FROM "Document" WHERE "documentID" = $1 AND "uploadedBy" = $2`,
      [documentID, req.user.UserID]
    );
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await pool.query(
      `UPDATE "Document" SET "folderID" = $1 WHERE "documentID" = $2`,
      [folderID, documentID]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Assign document to folder failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Remove document from folder
router.post('/unassign', async (req, res) => {
  try {
    const { documentID } = req.body;

    const pool = await getPool();
    await pool.query(
      `UPDATE "Document" SET "folderID" = NULL WHERE "documentID" = $1 AND "uploadedBy" = $2`,
      [documentID, req.user.UserID]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Unassign document from folder failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
