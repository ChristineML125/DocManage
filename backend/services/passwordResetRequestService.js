import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const serviceDir = path.dirname(fileURLToPath(import.meta.url));
// Keep reset requests outside the public upload directory.
const requestFile = path.join(serviceDir, '..', 'data', 'password-reset-requests.json');

async function readRequests() {
  try {
    const data = JSON.parse(await fs.readFile(requestFile, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeRequests(requests) {
  await fs.mkdir(path.dirname(requestFile), { recursive: true });
  await fs.writeFile(requestFile, JSON.stringify(requests, null, 2), 'utf8');
}

export async function listPasswordResetRequests() {
  return readRequests();
}

export async function createPasswordResetRequest(user) {
  const requests = await readRequests();
  const request = {
    UserID: user.UserID,
    UserName: user.UserName,
    Email: user.Email,
    requestedAt: new Date().toISOString()
  };
  const index = requests.findIndex((item) => Number(item.UserID) === Number(user.UserID));

  if (index >= 0) requests[index] = request;
  else requests.push(request);

  await writeRequests(requests);
  return request;
}

export async function completePasswordResetRequest(userID) {
  const requests = await readRequests();
  await writeRequests(requests.filter((item) => Number(item.UserID) !== Number(userID)));
}
