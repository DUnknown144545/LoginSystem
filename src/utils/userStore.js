import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(usersFile, '[]', 'utf8');
      return [];
    }
    throw err;
  }
}

async function writeUsers(users) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByUsername(username) {
  const users = await readUsers();
  return users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
}

export async function createUser({ username, password }) {
  const existing = await findUserByUsername(username);
  if (existing) {
    const e = new Error('Username already exists');
    e.code = 'USER_EXISTS';
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return { id: user.id, username: user.username };
}

export async function verifyCredentials(username, password) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, username: user.username };
}
