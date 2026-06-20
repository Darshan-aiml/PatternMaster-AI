import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

const DB_KEY_SECURE_KEY = 'db_encryption_key';

let cachedDbKey: string | null = null;

/**
 * Generates a random alphanumeric string in pure JavaScript.
 */
const generateRandomKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}_${Date.now()}`;
};

/**
 * Retrieves the hardware-secured database encryption key, generating one if it doesn't exist.
 */
export const getDatabaseKey = async (): Promise<string> => {
  if (cachedDbKey) return cachedDbKey;

  try {
    let key = await SecureStore.getItemAsync(DB_KEY_SECURE_KEY);
    if (!key) {
      key = generateRandomKey();
      await SecureStore.setItemAsync(DB_KEY_SECURE_KEY, key);
    }
    cachedDbKey = key;
    return key;
  } catch (error) {
    console.error('Error getting database encryption key:', error);
    return 'fallback_db_key_patternmaster_2026';
  }
};

/**
 * Encrypts a plaintext string using AES-256 encryption.
 */
export const encryptData = async (text: string): Promise<string> => {
  if (!text) return '';
  const key = await getDatabaseKey();
  const keyWords = CryptoJS.enc.Utf8.parse(key.substring(0, 16));
  const iv = CryptoJS.enc.Utf8.parse('patternmaster_iv');
  const encrypted = CryptoJS.AES.encrypt(text, keyWords, { iv });
  return encrypted.toString();
};

/**
 * Decrypts an encrypted ciphertext string back to plaintext.
 */
export const decryptData = async (ciphertext: string): Promise<string> => {
  if (!ciphertext) return '';
  try {
    const key = await getDatabaseKey();
    const keyWords = CryptoJS.enc.Utf8.parse(key.substring(0, 16));
    const iv = CryptoJS.enc.Utf8.parse('patternmaster_iv');
    const bytes = CryptoJS.AES.decrypt(ciphertext, keyWords, { iv });
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      // Fallback to legacy string passphrase decryption if it is an older DB entry
      try {
        const legacyBytes = CryptoJS.AES.decrypt(ciphertext, key);
        const legacyPlaintext = legacyBytes.toString(CryptoJS.enc.Utf8);
        if (legacyPlaintext) return legacyPlaintext;
      } catch (e) {
        // ignore fallback errors
      }
      return ciphertext;
    }
    return plaintext;
  } catch (error) {
    console.error('Failed to decrypt data, returning original content:', error);
    return ciphertext; // Fallback to original content in case of legacy plaintext
  }
};
