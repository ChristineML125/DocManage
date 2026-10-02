import { getPool } from "../config/db.js";

export const FREE_STORAGE_LIMIT_BYTES = 200 * 1024 * 1024;

export class QuotaExceededError extends Error {
  constructor(usage) {
    super(
      `Storage is full (${formatBytes(usage.usedBytes)} of ${formatBytes(usage.limitBytes)}). Delete files to free up space.`
    );
    this.name = "QuotaExceededError";
    this.status = 402;
    this.code = "STORAGE_QUOTA";
    this.usage = usage;
  }
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export async function getUsage(userID) {
  const pool = await getPool();
  const sizeResult = await pool.query(
    `SELECT COALESCE(SUM(dv."fileSizeBytes"), 0)::bigint AS used
     FROM "DocumentVersion" dv
     INNER JOIN "Document" d ON d."documentID" = dv."DocumentID"
     WHERE d."uploadedBy" = $1`,
    [userID]
  );
  const usedBytes = Number(sizeResult.rows[0]?.used || 0);

  return {
    usedBytes,
    limitBytes: FREE_STORAGE_LIMIT_BYTES,
    remainingBytes: Math.max(0, FREE_STORAGE_LIMIT_BYTES - usedBytes),
    usedLabel: formatBytes(usedBytes),
    limitLabel: formatBytes(FREE_STORAGE_LIMIT_BYTES),
    percent: Math.min(100, Math.round((usedBytes / FREE_STORAGE_LIMIT_BYTES) * 100)),
  };
}

export async function assertCanUpload(user, incomingBytes) {
  if ((user?.userType || "company") !== "personal") return null;
  const usage = await getUsage(user.UserID);
  if (usage.usedBytes + Number(incomingBytes || 0) > usage.limitBytes) {
    throw new QuotaExceededError(usage);
  }
  return usage;
}

