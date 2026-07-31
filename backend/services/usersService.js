import { getPool, sql } from "../config/db.js";
import crypto from "crypto";
import { addAuditLog } from "./auditLogsService.js";


// Create User
export async function createUser(
    userName,
    password,
    departmentId,
    role,
    email,
    createdBy
){

    const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    const pool = await getPool();

    const result = await pool.request()
        .input("userName", sql.VarChar(255), userName)
        .input("password", sql.NVarChar(255), hashedPassword)
        .input("departmentId", sql.Int, departmentId)
        .input("role", sql.VarChar(50), role)
        .input("email", sql.VarChar(255), email)
        .query(`
            INSERT INTO Users
            (
                UserName,
                Password,
                DepartmentID,
                role,
                Email,
                UserStatusID,
                CreatedAt,
                LastLogin
            )
            VALUES
            (
                @userName,
                @password,
                @departmentId,
                @role,
                @email,
                1,
                GETDATE(),
                NULL
            );

            SELECT SCOPE_IDENTITY() AS id;
        `);

    const userID = result.recordset[0].id;

    await addAuditLog({
        userID: createdBy,
        action:"Create User",
        targetEntity: "User",
        targetID: userID,
        description:`Created user ${userName}`
    });

    return true;
}


// Get All Users
export async function allUserList(){

    const pool = await getPool();

    const result = await pool.request()
    .query(`
        SELECT
            u.UserID,
            u.UserName,
            u.DepartmentID,
            u.role,
            d.departmentName,
            us.StatusName,
            u.CreatedAt,
            u.LastLogin
        FROM Users u
        LEFT JOIN Department d
        ON u.DepartmentID=d.departmentID
        LEFT JOIN UserStatus us
        ON u.UserStatusID=us.UserStatusID
        ORDER BY u.UserName
    `);

    return result.recordset;
}


// Get User
export async function getUser(userID){

    const pool = await getPool();

    const result = await pool.request()
    .input("userID",sql.Int,userID)
    .query(`
        SELECT
            u.UserID,
            u.UserName,
            u.Email,
            u.DepartmentID,
            u.role,
            d.departmentName,
            us.StatusName,
            u.CreatedAt,
            u.LastLogin
        FROM Users u
        LEFT JOIN Department d
        ON u.DepartmentID=d.departmentID
        LEFT JOIN UserStatus us
        ON u.UserStatusID=us.UserStatusID
        WHERE u.UserID=@userID
    `);


    if(result.recordset.length===0){
        throw new Error("User not found");
    }

    return result.recordset[0];
}


// Edit User
export async function editUser(
    userID,
    {
        userName,
        departmentId,
        role,
        email
    },
    updatedBy
){

    const pool = await getPool();

    await pool.request()
    .input("userID",sql.Int,userID)
    .input("userName",sql.VarChar,userName)
    .input("departmentId",sql.Int,departmentId)
    .input("role",sql.VarChar,role)
    .input("email",sql.VarChar,email)
    .query(`
        UPDATE Users
        SET
            UserName=@userName,
            DepartmentID=@departmentId,
            role=@role,
            Email=@email
        WHERE UserID=@userID
    `);


    await addAuditLog({
        userID:updatedBy,
        action:"Update User",
        targetEntity: "User",
        targetID: userID,
        description:`Updated user ${userName}`
    });


    return true;
}


// Update Status
export async function updateUserStatus(
    userID,
    status,
    updatedBy
){

    const pool = await getPool();


    const statusResult =
    await pool.request()
    .input("status",sql.VarChar,status)
    .query(`
        SELECT UserStatusID
        FROM UserStatus
        WHERE StatusName=@status
    `);


    if(statusResult.recordset.length===0){
        throw new Error("Invalid status");
    }


    const statusID =
    statusResult.recordset[0].UserStatusID;


    await pool.request()
    .input("userID",sql.Int,userID)
    .input("statusID",sql.Int,statusID)
    .query(`
        UPDATE Users
        SET UserStatusID=@statusID
        WHERE UserID=@userID
    `);


    await addAuditLog({
        userID:updatedBy,
        action:status==="Inactive"
            ?"Block User"
            :"Unblock User",
        targetEntity: "User",
        targetID: userID,
        description:
        `Changed user ${userID} status to ${status}`
    });


    return true;
}


// Reset Password
export async function resetPassword(
    userID,
    newPassword,
    adminID
){

    const hashedPassword =
    crypto.createHash("sha256")
    .update(newPassword)
    .digest("hex");


    const pool=await getPool();


    await pool.request()
    .input("userID",sql.Int,userID)
    .input("password",sql.NVarChar,hashedPassword)
    .query(`
        UPDATE Users
        SET
            Password=@password,
            MustChangePassword=1
        WHERE UserID=@userID
    `);

    await addAuditLog({
        userID: adminID,
        action: "Reset Password",
        targetEntity: "User",
        targetID: userID,
        description:`Reset password for user ${userID}`
    });


    return true;
}


// Change Password
export async function changePassword(
    userID,
    currentPassword,
    newPassword
){

    const pool=await getPool();


    const result =
    await pool.request()
    .input("userID",sql.Int,userID)
    .query(`
        SELECT Password
        FROM Users
        WHERE UserID=@userID
    `);


    const user=result.recordset[0];


    const oldHash =
    crypto.createHash("sha256")
    .update(currentPassword)
    .digest("hex");


    if(oldHash!==user.Password.trim()){
        throw new Error("Incorrect password");
    }


    const newHash =
    crypto.createHash("sha256")
    .update(newPassword)
    .digest("hex");


    await pool.request()
    .input("userID",sql.Int,userID)
    .input("password",sql.NVarChar,newHash)
    .query(`
        UPDATE Users
        SET Password=@password,
        MustChangePassword=0
        WHERE UserID=@userID
    `);


    await addAuditLog({
        userID:userID,
        action:"Change Password",
        targetEntity: "User",
        targetID: userID,
        description:"Changed own password"
    });


    return true;
}

export async function getCount(){

    const pool = await getPool();

    const result = await pool.request()
    .query(`
        SELECT
            COUNT(*) AS totalUsers,
            SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) AS adminCount,
            SUM(CASE WHEN role='staff' THEN 1 ELSE 0 END) AS staffCount
        FROM Users u
        JOIN UserStatus us
        ON u.UserStatusID=us.UserStatusID
        WHERE us.StatusName='Active'
    `);


    return result.recordset[0];
}