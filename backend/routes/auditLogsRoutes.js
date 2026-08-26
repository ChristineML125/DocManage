import express from "express";
import {authenticate} from "../middleware/auth.js";
import {resolveCompanyScope} from "../services/tenantService.js";
import {listAuditLogs} from "../services/auditLogsService.js"

const router = express.Router();

router.get("/", authenticate, async(req,res)=>{
    try{
        const scope = await resolveCompanyScope(req.user);
        const logs = await listAuditLogs({ companyID: scope.companyID });
        res.json({
            success:true,
            auditLog: logs
        });
    }catch(err){
        console.error("Audit Log Error: ", err);
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});

export default router;
