import { getPool } from "../config/db.js";
import crypto from "crypto";
import { addAuditLog } from "./auditLogsService.js";
import { getAvatarPath } from "./profileService.js";


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

    const result = await pool.query(`
        INSERT INTO "Users"
        (
            "UserName",
            "Password",
            "DepartmentID",
            "role",
            "Email",
            "UserStatusID",
            "CreatedAt",
            "LastLogin"
        )
        VALUES ($1, $2, $3, $4, $5, 1, NOW(), NULL)
        RETURNING "UserID" AS id
    `,
    [userName, hashedPassword, departmentId, role, email]);

    const userID = result.rows[0].id;

    await addAuditLog({
        userID: createdBy,
        action:"Create User",
        targetEntity: "User",
        targetID: userID,
        description:`Created user ${userName}`
    });

    return true;
}


export async function allUserList(){

    const pool = await getPool();

    const result = await pool.query(`
        SELECT
            u."UserID",
            u."UserName",
            u."Email",
            u."DepartmentID",
            u."role",
            d."departmentName",
            us."StatusName",
            u."CreatedAt",
            u."LastLogin"
        FROM "Users" u
        LEFT JOIN "Department" d
        ON u."DepartmentID"=d."departmentID"
        LEFT JOIN "UserStatus" us
        ON u."UserStatusID"=us."UserStatusID"
        WHERE u."userType" IS NULL OR u."userType" = 'company'
        ORDER BY u."UserName"
    `);

    return Promise.all(result.rows.map(async (user) => ({
        ...user,
        AvatarPath: await getAvatarPath(user.UserID)
    })));
}


export async function getUser(userID){

    const pool = await getPool();

    const result = await pool.query(`
        SELECT
            u."UserID",
            u."UserName",
            u."Email",
            u."DepartmentID",
            u."role",
            d."departmentName",
            us."StatusName",
            u."CreatedAt",
            u."LastLogin"
        FROM "Users" u
        LEFT JOIN "Department" d
        ON u."DepartmentID"=d."departmentID"
        LEFT JOIN "UserStatus" us
        ON u."UserStatusID"=us."UserStatusID"
        WHERE u."UserID"=$1
    `,
    [userID]);


    if(result.rows.length===0){
        throw new Error("User not found");
    }

    return result.rows[0];
}


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

    await pool.query(`
        UPDATE "Users"
        SET
            "UserName"=$1,
            "DepartmentID"=$2,
            "role"=$3,
            "Email"=$4
        WHERE "UserID"=$5
    `,
    [userName, departmentId, role, email, userID]);


    await addAuditLog({
        userID:updatedBy,
        action:"Update User",
        targetEntity: "User",
        targetID: userID,
        description:`Updated user ${userName}`
    });


    return true;
}


export async function updateUserStatus(
    userID,
    status,
    updatedBy
){

    const pool = await getPool();


    const statusResult = await pool.query(
        `SELECT "UserStatusID" FROM "UserStatus" WHERE "StatusName"=$1`,
        [status]
    );


    if(statusResult.rows.length===0){
        throw new Error("Invalid status");
    }


    const statusID = statusResult.rows[0].UserStatusID;


    await pool.query(`
        UPDATE "Users"
        SET "UserStatusID"=$1
        WHERE "UserID"=$2
    `,
    [statusID, userID]);


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


    await pool.query(`
        UPDATE "Users"
        SET
            "Password"=$1,
            "MustChangePassword"=true
        WHERE "UserID"=$2
    `,
    [hashedPassword, userID]);

    await addAuditLog({
        userID: adminID,
        action: "Reset Password",
        targetEntity: "User",
        targetID: userID,
        description:`Reset password for user ${userID}`
    });


    return true;
}


export async function changePassword(
    userID,
    currentPassword,
    newPassword
){

    const pool=await getPool();


    const result = await pool.query(
        `SELECT "Password" FROM "Users" WHERE "UserID"=$1`,
        [userID]
    );


    const user=result.rows[0];


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


    await pool.query(`
        UPDATE "Users"
        SET "Password"=$1,
            "MustChangePassword"=false
        WHERE "UserID"=$2
    `,
    [newHash, userID]);


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

    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS "totalUsers",
            SUM(CASE WHEN "role"='admin' THEN 1 ELSE 0 END)::int AS "adminCount",
            SUM(CASE WHEN "role"='staff' THEN 1 ELSE 0 END)::int AS "staffCount"
        FROM "Users" u
        JOIN "UserStatus" us
        ON u."UserStatusID"=us."UserStatusID"
        WHERE us."StatusName"='Active'
        AND (u."userType" IS NULL OR u."userType" = 'company')
    `);


    return result.rows[0];
}


export async function registerPersonalUser(userName, password, email) {

    const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    const pool = await getPool();

    const result = await pool.query(`
        INSERT INTO "Users"
        (
            "UserName",
            "Password",
            "Email",
            "role",
            "UserStatusID",
            "userType",
            "MustChangePassword",
            "CreatedAt"
        )
        VALUES ($1, $2, $3, 'staff', 1, 'personal', false, NOW())
        RETURNING "UserID" AS id
    `,
    [userName, hashedPassword, email]);

    return result.rows[0].id;
}
