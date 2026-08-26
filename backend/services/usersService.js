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
    createdBy,
    companyID = null
){

    const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    const pool = await getPool();

    // Username must be unique within the same company only;
    // different companies may reuse the same username.
    const nameCheck = await pool.query(
        `SELECT 1 FROM "Users"
         WHERE LOWER("UserName") = LOWER($1)
         AND "CompanyID" IS NOT DISTINCT FROM $2`,
        [userName, companyID]
    );
    if(nameCheck.rows.length > 0){
        throw new Error("Username already exists in this company");
    }

    // Email stays globally unique - it is the unambiguous login key.
    if(email){
        const emailCheck = await pool.query(
            `SELECT 1 FROM "Users" WHERE LOWER("Email") = LOWER($1)`,
            [email]
        );
        if(emailCheck.rows.length > 0){
            throw new Error("Email already exists");
        }
    }

    if(companyID && departmentId){
        const deptCheck = await pool.query(
            `SELECT 1 FROM "Department" WHERE "departmentID" = $1 AND "CompanyID" = $2`,
            [departmentId, companyID]
        );
        if(deptCheck.rows.length === 0){
            throw new Error("Invalid department for this company");
        }
    }

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
            "LastLogin",
            "CompanyID"
        )
        VALUES ($1, $2, $3, $4, $5, 1, NOW(), NULL, $6)
        RETURNING "UserID" AS id
    `,
    [userName, hashedPassword, departmentId, role, email, companyID]);

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


export async function allUserList(companyID = null){

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
        WHERE (u."userType" IS NULL OR u."userType" = 'company')
        AND ($1::int IS NULL OR u."CompanyID" = $1)
        ORDER BY u."UserName"
    `, [companyID]);

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

    const target = await pool.query(
        `SELECT "CompanyID", "userType" FROM "Users" WHERE "UserID"=$1`,
        [userID]
    );
    if(target.rows.length === 0){
        throw new Error("User not found");
    }
    const scopeCompanyID = target.rows[0].userType === 'personal'
        ? null
        : (target.rows[0].CompanyID || null);

    if(userName){
        const nameCheck = await pool.query(
            `SELECT 1 FROM "Users"
             WHERE LOWER("UserName") = LOWER($1)
             AND "UserID" != $2
             AND "CompanyID" IS NOT DISTINCT FROM $3`,
            [userName, userID, scopeCompanyID]
        );
        if(nameCheck.rows.length > 0){
            throw new Error("Username already exists in this company");
        }
    }

    if(email){
        const emailCheck = await pool.query(
            `SELECT 1 FROM "Users" WHERE LOWER("Email") = LOWER($1) AND "UserID" != $2`,
            [email, userID]
        );
        if(emailCheck.rows.length > 0){
            throw new Error("Email already exists");
        }
    }

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


export async function deleteUser(userID, deletedBy) {
    const pool = await getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // remove documents uploaded by this user (and their dependencies)
        const docs = await client.query(
            `SELECT "documentID" FROM "Document" WHERE "uploadedBy" = $1`,
            [userID]
        );

        for (const doc of docs.rows) {
            const documentID = doc.documentID;
            await client.query(`DELETE FROM "AISummary" WHERE "documentID" = $1`, [documentID]);
            await client.query(`DELETE FROM "DocumentVersion" WHERE "DocumentID" = $1`, [documentID]);
            await client.query(`DELETE FROM "Favorites" WHERE "documentID" = $1`, [documentID]);
            await client.query(`DELETE FROM "UsersDocument" WHERE "documentID" = $1`, [documentID]);
            await client.query(`DELETE FROM "Document" WHERE "documentID" = $1`, [documentID]);
        }

        await client.query(`DELETE FROM "Favorites" WHERE "UserID" = $1`, [userID]);
        await client.query(`DELETE FROM "OneTimePassword" WHERE "UserID" = $1`, [userID]);
        await client.query(`DELETE FROM "PasswordResetToken" WHERE "UserID" = $1`, [userID]);

        // keep audit history but detach it from the deleted account
        await client.query(`UPDATE "AuditLog" SET "UserID" = NULL WHERE "UserID" = $1`, [userID]);

        const result = await client.query(
            `DELETE FROM "Users" WHERE "UserID" = $1 RETURNING "UserName"`,
            [userID]
        );

        if (result.rowCount === 0) {
            throw new Error("User not found");
        }

        await client.query('COMMIT');

        const userName = result.rows[0].UserName;

        await addAuditLog({
            userID: deletedBy,
            action: "Delete User",
            targetEntity: "User",
            targetID: userID,
            description: `Deleted user ${userName} and their documents`
        });

        return userName;
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
        }
        throw err;
    } finally {
        client.release();
    }
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

export async function getCount(companyID = null){

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
        AND ($1::int IS NULL OR u."CompanyID" = $1)
    `, [companyID]);


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
