import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const serviceDir = path.dirname(fileURLToPath(import.meta.url));
const profileFile = path.join(serviceDir, '..', '..', 'storage', 'profile-photos.json');

async function readProfiles() {
    try {
        return JSON.parse(await fs.readFile(profileFile, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        throw error;
    }
}

export async function getAvatarPath(userId) {
    const profiles = await readProfiles();
    return profiles[String(userId)] || null;
}

export async function saveAvatarPath(userId, avatarPath) {
    const profiles = await readProfiles();
    profiles[String(userId)] = avatarPath;
    await fs.mkdir(path.dirname(profileFile), { recursive: true });
    await fs.writeFile(profileFile, JSON.stringify(profiles, null, 2), 'utf8');
}
