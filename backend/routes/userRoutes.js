import express from "express";
import crypto from "crypto";
import { getPool, sql } from "../config/db.js";
import { avatarUpload } from "../middleware/upload.js";
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
    getCount
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


// Login
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

        const result=await pool.request()
        .input("UserName",sql.VarChar,UserName)
        .query(`
            SELECT *
            FROM Users
            WHERE UserName=@UserName
            AND UserStatusID=1
        `);

        const user=result.recordset[0];

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

        await pool.request()
        .input("UserID",sql.Int,user.UserID)
        .query(`
            UPDATE Users
            SET LastLogin=GETDATE()
            WHERE UserID=@UserID
        `);

        const token = jwt.sign({
            UserID:user.UserID,
            UserName:user.UserName,
            Email:user.Email,
            role:user.role
        },
        process.env.JWT_SECRET,{
            expiresIn:"8h"
        });

        res.json({
            success:true,
            token,
            mustChangePassword:user.MustChangePassword===1,
            user:{
                UserID:user.UserID,
                UserName:user.UserName,
                Email:user.Email,
                role:user.role
            }
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});


// Change Password
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

        await changePassword(
            userID,
            currentPassword,
            newPassword
        );

        res.json({
            success:true,
            message:"Password changed successfully"
        });

    }catch(err){

        res.status(400).json({
            success:false,
            message:err.message
        });

    }
});


// User Count
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

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

});

// Get All User
router.get("/list", authenticate, requireAdmin, async(req,res)=>{
    try{
        const users=await allUserList();

        res.json({
            success:true,
            users
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});

// Create User
router.post("/", authenticate, requireAdmin, async(req,res)=>{
    const {
        UserName,
        Password,
        DepartmentID,
        role,
        Email
    }=req.body;

    if(!UserName || !Password || !DepartmentID || !role || !Email){
        return res.status(400).json({
            success:false,
            message:"Missing required fields"
        });
    }

    try{
        await createUser(
            UserName,
            Password,
            DepartmentID,
            role,
            Email,
            req.user.UserID
        );

        res.json({
            success:true,
            message:"User created successfully"
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});

// Password Reset Requests
router.get("/password-reset-requests", authenticate, requireAdmin, async(req,res)=>{
    try{
        res.json({
            success:true,
            requests:await listPasswordResetRequests()
        });


    }catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }
});

// Edit User
router.put("/:id", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);

        await editUser(
            userID,
            {
                userName:req.body.UserName,
                departmentId:req.body.DepartmentID,
                role:req.body.role,
                email:req.body.Email
            },
            req.user.UserID
        );

        res.json({
            success:true,
            message:"User updated successfully"
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});


// Update User Status
router.put("/:id/status", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);

        await updateUserStatus(
            userID,
            req.body.status,
            req.user.UserID
        );

        res.json({
            success:true,
            message:"User status updated"
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});


// Reset Password
router.post("/:id/reset-password", authenticate, requireAdmin, async(req,res)=>{
    try{
        const userID=Number(req.params.id);

        if(isNaN(userID)){
            return res.status(400).json({
                success:false,
                message:"Invalid User ID"
            });
        }

        const tempPassword=
        Math.floor(100000+Math.random()*900000).toString();


        await resetPassword(
            userID,
            tempPassword,
            req.user.UserID
        );

        res.json({
            success:true,
            tempPassword
        });

    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});

// Generate and email a temporary password.  The reset request is cleared only
// after the SMTP server confirms the message was accepted for delivery.
router.post("/:id/send-temp-password", authenticate, requireAdmin, async(req,res)=>{
    const userID = Number(req.params.id);
    if (Number.isNaN(userID)) {
        return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    try {
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

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { UserName } = req.body;

    if (!UserName) {
        return res.status(400).json({
            success: false,
            message: "Please enter your username"
        });
    }

    try {
        const pool = await getPool();

        // Check whether user exists
        const result = await pool.request()
            .input("UserName", sql.VarChar, UserName)
            .query(`
                SELECT UserID, UserName, Email
                FROM Users
                WHERE UserName = @UserName
                AND UserStatusID = 1
            `);

        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Mark user as requiring password reset and persist the request so it
        // is visible to administrators until the temporary password is emailed.
        await pool.request()
            .input("UserID", sql.Int, user.UserID)
            .query(`
                UPDATE Users
                SET MustChangePassword = 1
                WHERE UserID = @UserID
            `);

        await createPasswordResetRequest(user);

        res.json({
            success: true,
            message: "Password reset request submitted successfully"
        });

    } catch (err) {
        console.error("Forgot password error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Upload Avatar
router.post("/:id/avatar",
authenticate,
avatarUpload.single("avatar"),
async(req,res)=>{

    const userID=Number(req.params.id);

    if(isNaN(userID)||!req.file){
        return res.status(400).json({
            success:false,
            message:"Invalid user or file"
        });
    }

    if (Number(req.user.UserID) !== userID && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You can only update your own profile photo.' });
    }

    try{

        await saveAvatarPath(
            userID,
            req.file.filename
        );

        res.json({
            success:true,
            avatarPath:req.file.filename
        });

    }catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }
});


// Get User Detail
router.get("/:id", authenticate, async(req,res)=>{
    try{
        const userID=Number(req.params.id);

        if(isNaN(userID)){
            return res.status(400).json({
                success:false,
                message:"Invalid User ID"
            });
        }

        if (Number(req.user.UserID) !== userID && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You can only view your own profile.' });
        }

        const user=await getUser(userID);

        user.AvatarPath=await getAvatarPath(userID);

        res.json({
            success:true,
            user
        });

    }catch(err){
        res.status(404).json({
            success:false,
            message:err.message
        });
    }
});


export default router;
