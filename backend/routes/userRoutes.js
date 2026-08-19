import express from "express";
import crypto from "crypto";
import { getPool } from "../config/db.js";
import { avatarUpload, generateUniqueFilename } from "../middleware/upload.js";
import { isConfigured, uploadFile } from "../config/storage.js";
import { getAvatarPath, saveAvatarPath } from "../services/profileService.js";
import {
    completePasswordResetRequest,
    createPasswordResetRequest,
    listPasswordResetRequests
} from "../services/passwordResetRequestService.js";
import { sendTemporaryPasswordEmail } from "../services/emailService.js";
import {
    createUser,
    editUser,
    updateUserStatus,
    resetPassword,
    changePassword,
    getUser,
    allUserList,
    getCount,
    registerPersonalUser
} from "../services/usersService.js";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Administrator access is required.' });
    }
    next();
}


router.post("/login", async(req,res)=>{
    const {UserName, Password}=req.body;

    if(!UserName || !Password){
        return res.status(400).json({
            success:false,
            message:"Please Input ID and Password"
        });
    }

    try{
        const pool=await getPool();

        const result=await pool.query(`
            SELECT *
            FROM "Users"
            WHERE ("UserName"=$1 OR "Email"=$1)
            AND "UserStatusID"=1
        `,
        [UserName]);

        const user=result.rows[0];

        if(!user){
            return res.json({
                success:false,
                message:"Invalid account or inactive account"
            });
        }

        const hash=crypto.createHash("sha256")
        .update(Password)
        .digest("hex");

        if(hash!==user.Password.trim()){
            return res.json({
                success:false,
                message:"Incorrect Password"
            });
        }

        await pool.query(`
            UPDATE "Users"
            SET "LastLogin"=NOW()
            WHERE "UserID"=$1
        `,
        [user.UserID]);

        const token = jwt.sign({
            UserID:user.UserID,
            UserName:user.UserName,
            Email:user.Email,
            role:user.role,
            userType:user.userType || 'company',
            CompanyID:user.CompanyID || null
        },
        process.env.JWT_SECRET,{
            expiresIn:"8h"
        });

        res.json({
            success:true,
            token,
            mustChangePassword:user.MustChangePassword===true || user.MustChangePassword===1,
            user:{
                UserID:user.UserID,
                UserName:user.UserName,
                Email:user.Email,
                role:user.role,
                userType:user.userType || 'company',
                CompanyID:user.CompanyID || null
            }
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});


router.post("/register/personal", async(req,res)=>{
    const { UserName, Password, Email } = req.body;

    if(!UserName || !Password || !Email){
        return res.status(400).json({ success:false, message:"Please fill in all fields" });
    }

    try{
        const pool = await getPool();

        const existing = await pool.query(
            `SELECT "UserID" FROM "Users" WHERE "UserName"=$1`, [UserName]
        );
        if(existing.rows.length > 0){
            return res.status(409).json({ success:false, message:"Username already exists" });
        }

        const emailCheck = await pool.query(
            `SELECT "UserID" FROM "Users" WHERE "Email"=$1`, [Email]
        );
        if(emailCheck.rows.length > 0){
            return res.status(409).json({ success:false, message:"Email already exists" });
        }

        const userID = await registerPersonalUser(UserName, Password, Email);

        res.json({ success:true, message:"Account created successfully. You can now login.", userID });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.post("/register/company", async(req,res)=>{
    const { CompanyName, CompanyEmail, CompanyPhone, CompanyAddress, AdminName, AdminEmail, Password } = req.body;

    if(!CompanyName || !AdminName || !AdminEmail || !Password){
        return res.status(400).json({ success:false, message:"Please fill in all required fields" });
    }

    try{
        const pool = await getPool();

        const userCheck = await pool.query(
            `SELECT "UserID" FROM "Users" WHERE "UserName"=$1`, [AdminName]
        );
        if(userCheck.rows.length > 0){
            return res.status(409).json({ success:false, message:"Admin name already exists" });
        }

        const emailCheck = await pool.query(
            `SELECT "UserID" FROM "Users" WHERE "Email"=$1`, [AdminEmail]
        );
        if(emailCheck.rows.length > 0){
            return res.status(409).json({ success:false, message:"Email already exists" });
        }

        const companyResult = await pool.query(
            `INSERT INTO "Companies" ("CompanyName", "CompanyEmail", "CompanyPhone", "CompanyAddress")
             VALUES ($1, $2, $3, $4) RETURNING "CompanyID"`,
            [CompanyName, CompanyEmail || null, CompanyPhone || null, CompanyAddress || null]
        );
        const companyID = companyResult.rows[0].CompanyID;

        const crypto = await import('crypto');
        const hash = crypto.default.createHash("sha256").update(Password).digest("hex");

        const userResult = await pool.query(
            `INSERT INTO "Users" ("UserName", "Password", "Email", "role", "userType", "CompanyID", "UserStatusID", "CreatedAt")
             VALUES ($1, $2, $3, 'admin', 'company', $4, 1, NOW())
             RETURNING "UserID"`,
            [AdminName, hash, AdminEmail, companyID]
        );

        res.json({ success:true, message:"Company account created successfully. You can now login.", userID: userResult.rows[0].UserID, companyID });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});


router.put("/change-password", authenticate, async(req,res)=>{
    const {
        userID,
        currentPassword,
        newPassword
    }=req.body;

    if (Number(userID) !== Number(req.user.UserID)) {
        return res.status(403).json({ success: false, message: 'You can only change your own password.' });
    }

    try{
        await changePassword(userID, currentPassword, newPassword);
        res.json({ success:true, message:"Password changed successfully" });
    }catch(err){
        res.status(400).json({ success:false, message:err.message });
    }
});

router.put("/profile", authenticate, async(req,res)=>{
    const { UserName, Email } = req.body;
    const userID = req.user.UserID;

    if (!UserName || !UserName.trim()) {
        return res.status(400).json({ success:false, message:"Username is required" });
    }

    try{
        const pool = await getPool();

        const existing = await pool.query(`SELECT "UserID" FROM "Users" WHERE "UserName" = $1 AND "UserID" != $2`, [UserName.trim(), userID]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success:false, message:"Username already taken" });
        }

        if (Email && Email.trim()) {
            const emailExists = await pool.query(`SELECT "UserID" FROM "Users" WHERE "Email" = $1 AND "UserID" != $2`, [Email.trim(), userID]);
            if (emailExists.rows.length > 0) {
                return res.status(400).json({ success:false, message:"Email already in use" });
            }
        }

        await pool.query(`UPDATE "Users" SET "UserName" = $1, "Email" = $2 WHERE "UserID" = $3`, [UserName.trim(), Email?.trim() || null, userID]);
        res.json({ success:true, message:"Profile updated successfully" });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});


router.get("/count",async(req,res)=>{
    try{
        const data = await getCount();
        res.json({
            success:true,
            totalUsers: data.totalUsers,
            adminCount: data.adminCount,
            staffCount: data.staffCount
        });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.get("/list", authenticate, requireAdmin, async(req,res)=>{
    try{
        const users=await allUserList();
        res.json({ success:true, users });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.post("/", authenticate, requireAdmin, async(req,res)=>{
    const {
        UserName, Password, DepartmentID, role, Email
    }=req.body;

    if(!UserName || !Password || !DepartmentID || !role || !Email){
        return res.status(400).json({ success:false, message:"Missing required fields" });
    }

    try{
        await createUser(UserName, Password, DepartmentID, role, Email, req.user.UserID);
        res.json({ success:true, message:"User created successfully" });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.get("/password-reset-requests", authenticate, requireAdmin, async(req,res)=>{
    try{
        res.json({ success:true, requests:await listPasswordResetRequests() });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.put("/:id", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);
        await editUser(userID, {
            userName:req.body.UserName,
            departmentId:req.body.DepartmentID,
            role:req.body.role,
            email:req.body.Email
        }, req.user.UserID);
        res.json({ success:true, message:"User updated successfully" });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.put("/:id/status", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);
        await updateUserStatus(userID, req.body.status, req.user.UserID);
        res.json({ success:true, message:"User status updated" });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.post("/:id/reset-password", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);
        if(isNaN(userID)){
            return res.status(400).json({ success:false, message:"Invalid User ID" });
        }

        const pool = await getPool();
        const check = await pool.query(`SELECT "userType" FROM "Users" WHERE "UserID"=$1`, [userID]);
        if (check.rows[0]?.userType === 'personal') {
            return res.status(403).json({ success:false, message:"Cannot reset password for personal users" });
        }

        const tempPassword=Math.floor(100000+Math.random()*900000).toString();
        await resetPassword(userID, tempPassword, req.user.UserID);
        res.json({ success:true, tempPassword });
    }catch(err){
        res.status(500).json({ success:false, message:err.message });
    }
});

router.post("/:id/send-temp-password", authenticate, requireAdmin, async(req,res)=>{
    const userID = Number(req.params.id);
    if (Number.isNaN(userID)) {
        return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }
    try {
        const pool = await getPool();
        const check = await pool.query(`SELECT "userType" FROM "Users" WHERE "UserID"=$1`, [userID]);
        if (check.rows[0]?.userType === 'personal') {
            return res.status(403).json({ success: false, message: 'Cannot send temp password to personal users' });
        }

        const user = await getUser(userID);
        if (!user.Email) {
            return res.status(400).json({ success: false, message: 'This user does not have an email address.' });
        }
        const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
        await resetPassword(userID, tempPassword, req.user.UserID);
        await sendTemporaryPasswordEmail({
            email: user.Email,
            userName: user.UserName,
            temporaryPassword: tempPassword
        });
        await completePasswordResetRequest(userID);
        res.json({ success: true, message: `Temporary password sent to ${user.Email}.` });
    } catch (err) {
        console.error('Send temporary password failed:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { UserName } = req.body;
    if (!UserName) {
        return res.status(400).json({ success: false, message: "Please enter your username or email" });
    }
    try {
        const pool = await getPool();
        const result = await pool.query(`
            SELECT "UserID", "UserName", "Email"
            FROM "Users"
            WHERE ("UserName" = $1 OR "Email" = $1)
            AND "UserStatusID" = 1
        `, [UserName]);

        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await pool.query(`
            UPDATE "Users"
            SET "MustChangePassword" = true
            WHERE "UserID" = $1
        `, [user.UserID]);

        await createPasswordResetRequest(user);

        res.json({ success: true, message: "Password reset request submitted successfully" });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/:id/avatar",
    authenticate,
    avatarUpload.single("avatar"),
    async(req,res)=>{
        const userID=Number(req.params.id);
        if(isNaN(userID)||!req.file){
            return res.status(400).json({ success:false, message:"Invalid user or file" });
        }
        if (Number(req.user.UserID) !== userID && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You can only update your own profile photo.' });
        }
        try{
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
            await saveAvatarPath(userID, filename);
            res.json({ success:true, avatarPath:filename });
        }catch(err){
            res.status(500).json({ success:false, message:err.message });
        }
});

router.get("/:id", authenticate, async(req,res)=>{
    try{
        const userID=Number(req.params.id);
        if(isNaN(userID)){
            return res.status(400).json({ success:false, message:"Invalid User ID" });
        }
        if (Number(req.user.UserID) !== userID && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You can only view your own profile.' });
        }
        const user=await getUser(userID);
        user.AvatarPath=await getAvatarPath(userID);
        res.json({ success:true, user });
    }catch(err){
        res.status(404).json({ success:false, message:err.message });
    }
});


export default router;
