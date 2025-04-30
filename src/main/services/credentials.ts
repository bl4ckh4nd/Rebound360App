import keytar from 'keytar';
import crypto from 'crypto';

const SERVICE_NAME = 'JTLSupplierReturn';
const ACCOUNT_KEY = 'encryption-key';
const ACCOUNT_SALT = 'encryption-salt';

export async function getEncryptionKey(): Promise<string> {
  let key = await keytar.getPassword(SERVICE_NAME, ACCOUNT_KEY);
  console.log('[Credentials] Encryption key exists:', Boolean(key));
  
  if (!key) {
    key = crypto.randomBytes(32).toString('hex');
    console.log('[Credentials] Generated new encryption key');
    await setEncryptionKey(key);
  }
  
  if (key.length !== 64) {
    throw new Error('Invalid encryption key length');
  }
  
  return key;
}

export async function getEncryptionSalt(): Promise<string> {
  let salt = (await keytar.getPassword(SERVICE_NAME, ACCOUNT_SALT)) || '';
  
  if (!salt) {
    // Generate new 16-byte salt if none exists
    salt = crypto.randomBytes(16).toString('hex');
    await setEncryptionSalt(salt);
  }
  
  return salt!;
}

export async function setEncryptionKey(key: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_KEY, key);
}

export async function setEncryptionSalt(salt: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_SALT, salt);
}

// Migration function for existing installations
export async function migrateCredentialsFromEnv(): Promise<void> {
  // Deprecated - kept for backward compatibility
}
