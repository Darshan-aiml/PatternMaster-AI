import * as SecureStore from 'expo-secure-store';

const GEMINI_API_KEY_SECURE_KEY = 'gemini_api_key';

export const saveGeminiApiKey = async (key: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(GEMINI_API_KEY_SECURE_KEY, key);
  } catch (error) {
    console.error('Error saving API key to SecureStore:', error);
    throw error;
  }
};

export const getGeminiApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(GEMINI_API_KEY_SECURE_KEY);
  } catch (error) {
    console.error('Error getting API key from SecureStore:', error);
    return null;
  }
};

export const deleteGeminiApiKey = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(GEMINI_API_KEY_SECURE_KEY);
  } catch (error) {
    console.error('Error deleting API key from SecureStore:', error);
    throw error;
  }
};

// Backward-compatible aliases for legacy imports.
export const saveSecureApiKey = saveGeminiApiKey;
export const getSecureApiKey = getGeminiApiKey;
export const deleteSecureApiKey = deleteGeminiApiKey;

const NATIVE_USERS_STORE_KEY = 'registered_users';

export interface LocalUser {
  email: string;
  passwordHash: string;
  name: string;
  preferredLanguage: string;
  hasCompletedOnboarding: boolean;
  progress?: any[];
}

export const getLocalUsers = async (): Promise<Record<string, LocalUser>> => {
  try {
    const raw = await SecureStore.getItemAsync(NATIVE_USERS_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error getting local users:', error);
    return {};
  }
};

export const saveLocalUser = async (email: string, details: Omit<LocalUser, 'email'>): Promise<void> => {
  try {
    const users = await getLocalUsers();
    users[email.toLowerCase().trim()] = { email: email.toLowerCase().trim(), ...details };
    await SecureStore.setItemAsync(NATIVE_USERS_STORE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving local user:', error);
  }
};

export const saveActiveEmail = async (email: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('active_user_email', email.toLowerCase().trim());
  } catch (error) {
    console.error('Error saving active email:', error);
  }
};

export const getActiveEmail = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('active_user_email');
  } catch (error) {
    return null;
  }
};

export const deleteActiveEmail = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('active_user_email');
  } catch (error) {
    console.error('Error deleting active email:', error);
  }
};
