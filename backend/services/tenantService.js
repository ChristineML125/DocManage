import { getPool } from "../config/db.js";

// Resolve the tenant (company) scope for an authenticated request.
// - personal users have no company scope
// - company/staff/admin users are scoped to their CompanyID.
// Falls back to a fresh DB lookup when the token carries no CompanyID
// (e.g. tokens issued before multi-tenancy was introduced).
export async function resolveCompanyScope(user) {
    const userType = user?.userType || 'company';

    if (userType === 'personal') {
        return { userType, companyID: null };
    }

    let companyID = user?.CompanyID || null;

    if (!companyID && user?.UserID) {
        try {
            const pool = await getPool();
            const result = await pool.query(
                `SELECT "CompanyID" FROM "Users" WHERE "UserID" = $1`,
                [user.UserID]
            );
            companyID = result.rows[0]?.CompanyID || null;
        } catch (err) {
            console.error('Resolve company scope failed:', err);
            companyID = null;
        }
    }

    return { userType, companyID };
}
