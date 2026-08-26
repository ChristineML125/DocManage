import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolveCompanyScope } from '../services/tenantService.js';
import { deleteDepartment,
        getDepartmentLoad,
        createDepartment
    } from '../services/departmentService.js';

const router = express.Router();

router.get('/load', authenticate, async (req,res) => {
    try{
        const scope = await resolveCompanyScope(req.user);
        const data = await getDepartmentLoad(scope.companyID);
        res.json({
            success: true,
            departments: data
        });
    } catch (err){
        console.error ('Failed to get department load: ', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        const { name } = req.body;
        const department = await createDepartment( name, scope.companyID );
        res.json({ success: true, department });
    } catch (err) {
        console.error('Failed to create department:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});


router.delete('/:id', authenticate, async (req, res) => {
    try {
        const scope = await resolveCompanyScope(req.user);
        await deleteDepartment(parseInt(req.params.id), scope.companyID);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Failed to delete department:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;
