import express from 'express';
import { getPool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Get notes for a document
router.get('/document/:docId', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT * FROM "Note"
      WHERE "documentID" = $1 AND "userID" = $2
      ORDER BY "updatedAt" DESC
    `, [req.params.docId, req.user.UserID]);

    return res.json({ success: true, notes: result.rows });
  } catch (err) {
    console.error('Get notes failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { documentID, noteTitle, noteContent } = req.body;

    if (!noteContent?.trim() && !noteTitle?.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const pool = await getPool();
    const result = await pool.query(`
      INSERT INTO "Note" ("documentID", "userID", "noteTitle", "noteContent")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [documentID, req.user.UserID, noteTitle?.trim() || null, noteContent?.trim() || null]);

    return res.json({ success: true, note: result.rows[0] });
  } catch (err) {
    console.error('Create note failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { noteTitle, noteContent } = req.body;

    const pool = await getPool();
    const result = await pool.query(`
      UPDATE "Note"
      SET "noteTitle" = $1, "noteContent" = $2, "updatedAt" = NOW()
      WHERE "noteID" = $3 AND "userID" = $4
      RETURNING *
    `, [noteTitle?.trim() || null, noteContent?.trim() || null, req.params.id, req.user.UserID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.json({ success: true, note: result.rows[0] });
  } catch (err) {
    console.error('Update note failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      DELETE FROM "Note"
      WHERE "noteID" = $1 AND "userID" = $2
      RETURNING "noteID"
    `, [req.params.id, req.user.UserID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete note failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get note count per document for user's docs
router.get('/counts', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT "documentID", COUNT(*)::int AS "noteCount"
      FROM "Note"
      WHERE "userID" = $1
      GROUP BY "documentID"
    `, [req.user.UserID]);

    const counts = {};
    for (const row of result.rows) {
      counts[row.documentID] = row.noteCount;
    }

    return res.json({ success: true, counts });
  } catch (err) {
    console.error('Get note counts failed', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
