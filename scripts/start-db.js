import { execSync } from "child_process";

const service = process.env.SQL_SERVICE_NAME || "MSSQL$SQLEXPRESS";

function queryService() {
  try {
    return execSync(`sc query "${service}"`, { encoding: "utf8" });
  } catch {
    return "";
  }
}

function isRunning() {
  return /STATE\s*:\s*4\s+RUNNING/.test(queryService());
}

if (isRunning()) {
  console.log(`[db] ${service} is already running.`);
} else {
  console.log(`[db] Starting ${service}...`);
  try {
    execSync(`net start "${service}"`, { stdio: "inherit" });
    console.log(`[db] ${service} started.`);
  } catch (err) {
    console.error(
      `[db] Failed to start ${service}. Run this terminal as Administrator or start the service manually.`
    );
    process.exit(1);
  }
}
