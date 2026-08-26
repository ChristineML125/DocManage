import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolveCompanyScope } from '../services/tenantService.js';
import { getAllLookup } from '../services/lookupService.js';

const router = express.Router();

router.get('/all', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const lookups = await getAllLookup(scope.companyID);
        res.json({ success: true, ...lookups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
