/**
 * Move existing users into a (new) company.
 *
 * Usage:
 *   node assign-users-to-company.js "Company Name" email1@example.com,email2@example.com
 *
 * - Creates the company if it does not exist (seeds default departments/categories).
 * - Assigns each matched user to the company.
 * - Documents uploaded by those users automatically follow them,
 *   because document scoping joins the uploader's Users.CompanyID.
 */
import { getPool, closePool } from './config/db.js';

const [companyNameArg, usersArg] = process.argv.slice(2);

if (!companyNameArg || !usersArg) {
    console.error('Usage: node assign-users-to-company.js "Company Name" email1,email2,...');
    process.exit(1);
}

const companyName = companyNameArg.trim();
const identifiers = usersArg.split(',').map(s => s.trim()).filter(Boolean);

if (identifiers.length === 0) {
    console.error('No user emails/usernames provided.');
    process.exit(1);
}

async function main() {
    const pool = await getPool();

    // 1. Find or create the target company
    let company = await pool.query(
        `SELECT "CompanyID", "CompanyName" FROM "Companies" WHERE LOWER("CompanyName")=LOWER($1)`,
        [companyName]
    );

    let companyID;
    if (company.rows.length > 0) {
        companyID = company.rows[0].CompanyID;
        console.log(`Using existing company "${company.rows[0].CompanyName}" (ID=${companyID})`);
    } else {
        const created = await pool.query(
            `INSERT INTO "Companies" ("CompanyName") VALUES ($1) RETURNING "CompanyID"`,
            [companyName]
        );
        companyID = created.rows[0].CompanyID;
        console.log(`Created company "${companyName}" (ID=${companyID})`);

        // Seed defaults so the new company is usable immediately
        for (const dept of ['Administration', 'Finance', 'Human Resources', 'Operations', 'IT']) {
            await pool.query(
                `INSERT INTO "Department" ("departmentName", "CompanyID") VALUES ($1, $2)`,
                [dept, companyID]
            );
        }
        for (const [name, desc] of [
            ['Policy', 'Company policies and guidelines'],
            ['Report', 'Reports and analysis documents'],
            ['Memo', 'Internal memorandums'],
            ['Contract', 'Legal agreements and contracts'],
            ['Certificate', 'Certificates and credentials']
        ]) {
            await pool.query(
                `INSERT INTO "Category" ("categoriesName", "description", "CompanyID") VALUES ($1, $2, $3)`,
                [name, desc, companyID]
            );
        }
        console.log('Seeded default departments and categories.');
    }

    // 2. Assign each user
    let moved = 0;
    for (const id of identifiers) {
        const res = await pool.query(
            `SELECT "UserID", "UserName", "Email", "userType", "CompanyID"
             FROM "Users"
             WHERE LOWER("Email")=LOWER($1) OR LOWER("UserName")=LOWER($1)`,
            [id]
        );

        if (res.rows.length === 0) {
            console.log(`SKIP  ${id}  (not found)`);
            continue;
        }
        if (res.rows.length > 1) {
            console.log(`SKIP  ${id}  (matched multiple users, use exact email instead)`);
            continue;
        }

        const u = res.rows[0];
        if (u.userType === 'personal') {
            console.log(`SKIP  ${id}  (personal account cannot belong to a company)`);
            continue;
        }

        await pool.query(
            `UPDATE "Users" SET "CompanyID"=$1 WHERE "UserID"=$2`,
            [companyID, u.UserID]
        );
        moved++;
        console.log(`MOVED ${u.UserName} <${u.Email}>  (UserID=${u.UserID}, was CompanyID=${u.CompanyID})`);
    }

    console.log(`\nDone. ${moved}/${identifiers.length} user(s) assigned to "${companyName}" (CompanyID=${companyID}).`);
}

main()
    .catch(err => {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    })
    .finally(() => closePool());
