import express from 'express';
import { deleteDepartment, 
        getDepartmentLoad, 
        createDepartment 
    } from '../services/departmentService.js';

const router = express.Router();

router.get('/load', async (req,res) => {
    try{
        const data = await getDepartmentLoad();
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

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const department = await createDepartment( name );
        res.json({ success: true, department });
    } catch (err) {
        console.error('Failed to create department:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        await deleteDepartment(parseInt(req.params.id));
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Failed to delete department:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;