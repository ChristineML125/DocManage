import express from "express";
import {listAuditLogs} from "../services/auditLogsService.js"

const router = express.Router();

router.get("/", async(req,res)=>{
    try{
        const logs = await listAuditLogs();
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
