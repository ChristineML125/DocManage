import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolveCompanyScope } from '../services/tenantService.js';

import {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../services/categoriesService.js';

const router = express.Router();

// GET /api/categories - get all categories for the caller's company
router.get('/', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const categories = await listCategories(scope.companyID);
        res.json({ success: true, categories });
    } catch (err) {
        console.error('Failed to list categories:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/categories/:id - get a category
router.get('/:id', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const category = await getCategory(parseInt(req.params.id), scope.companyID);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, category });
    } catch (err) {
        console.error('Failed to get category:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/categories - create new category
router.post('/', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const { name, description } = req.body;
        const id = await createCategory(name, description, scope.companyID);
        return res.status(201).json({ success: true, id });
    } catch (err) {
        console.error('Failed to create category:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /api/categories/:id - update category
router.put('/:id', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const { name, description } = req.body;
        const category = await updateCategory(parseInt(req.params.id), name, description, scope.companyID);
        return res.json({ success: true, category });
    } catch (err) {
        console.error('Failed to update category:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /api/categories/:id - delete category
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        await deleteCategory(parseInt(req.params.id), scope.companyID);
        return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Failed to delete category:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;
