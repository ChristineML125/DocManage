import express from 'express';

import { getAllLookup } from '../services/lookupService.js';

const router = express.Router();

router.get('/all', async (req, res) => {
    try {
        const lookups = await getAllLookup();
        res.json({ success: true, ...lookups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;