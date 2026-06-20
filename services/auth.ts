import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import CryptoJS from 'crypto-js';
import { getLocalUsers, saveLocalUser } from './secureStore';

WebBrowser.maybeCompleteAuthSession();

const SECURE_ACCESS_TOKEN_KEY = 'auth_access_token';
const SECURE_ID_TOKEN_KEY = 'auth_id_token';
const SECURE_REFRESH_TOKEN_KEY = 'auth_refresh_token';

const OIDC_ISSUER = process.env.EXPO_PUBLIC_OIDC_ISSUER || 'https://auth.patternmaster.com';
const CLIENT_ID = process.env.EXPO_PUBLIC_OIDC_CLIENT_ID || 'patternmaster-mobile-client';

/**
 * Saves OIDC session tokens securely inside the device's secure store.
 */
export const saveAuthTokens = async (tokens: {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}) => {
  try {
    await SecureStore.setItemAsync(SECURE_ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.idToken) {
      await SecureStore.setItemAsync(SECURE_ID_TOKEN_KEY, tokens.idToken);
    }
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(SECURE_REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } catch (error) {
    console.error('Failed to save authentication tokens securely:', error);
  }
};

/**
 * Retrieves the stored session tokens.
 */
export const getAuthTokens = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync(SECURE_ACCESS_TOKEN_KEY);
    const idToken = await SecureStore.getItemAsync(SECURE_ID_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(SECURE_REFRESH_TOKEN_KEY);
    return { accessToken, idToken, refreshToken };
  } catch (error) {
    console.error('Failed to retrieve authentication tokens:', error);
    return { accessToken: null, idToken: null, refreshToken: null };
  }
};

/**
 * Clears all authentication tokens from secure storage.
 */
export const clearAuthTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(SECURE_ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SECURE_ID_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SECURE_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear authentication tokens:', error);
  }
};

/**
 * Decodes a standard JWT payload to parse profile claims.
 */
export const decodeJwtPayload = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
};

// Base64Url encoding helper
const base64UrlEncode = (source: CryptoJS.lib.WordArray): string => {
  let encoded = CryptoJS.enc.Base64.stringify(source);
  encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return encoded;
};

// Pure JS PKCE challenge generator
const generatePkce = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < 64; i++) {
    verifier += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const hash = CryptoJS.SHA256(verifier);
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
};

// Auto discovery of OIDC endpoints
const getDiscoveryEndpoints = async (issuer: string) => {
  try {
    const response = await fetch(`${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`);
    if (!response.ok) throw new Error('Discovery endpoint failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to discover OIDC endpoints, using defaults:', error);
    return {
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      userinfo_endpoint: `${issuer}/userinfo`,
    };
  }
};

/**
 * Executes a pure JS OIDC authentication and token exchange flow.
 */
export const promptOidcLogin = async (): Promise<{
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
} | null> => {
  try {
    const discovery = await getDiscoveryEndpoints(OIDC_ISSUER);
    const redirectUri = Linking.createURL('auth-callback');
    const { verifier, challenge } = generatePkce();

    // Construct OIDC authorize URL
    const authUrl = `${discovery.authorization_endpoint || discovery.authorizationEndpoint}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${challenge}&code_challenge_method=S256&scope=${encodeURIComponent('openid profile email offline_access')}`;

    // Open WebBrowser session
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== 'success') {
      return null;
    }

    // Extract auth code from redirect URL
    const code = result.url.match(/[?&]code=([^&]+)/)?.[1];
    if (!code) {
      throw new Error('No authorization code found in redirect URL');
    }

    // Perform OIDC Token Exchange
    const tokenResponse = await fetch(discovery.token_endpoint || discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=authorization_code&client_id=${CLIENT_ID}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}&code_verifier=${verifier}`,
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed with status ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return {
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      refreshToken: tokenData.refresh_token,
    };
  } catch (error) {
    console.error('OIDC login failed:', error);
    throw error;
  }
};


/**
 * Simulates email login or signup by verifying credentials locally in SecureStore
 * and generating a mock OIDC idToken and accessToken.
 */
export const simulateEmailAuth = async (
  email: string,
  password: string,
  isSignUp: boolean
): Promise<{
  accessToken: string;
  idToken: string;
  name: string;
  preferredLanguage: string;
  hasCompletedOnboarding: boolean;
  progress?: any[];
} | null> => {
  try {
    // Simulate a brief network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedEmail = email.toLowerCase().trim();
    const users = await getLocalUsers();
    const existingUser = users[normalizedEmail];

    if (isSignUp) {
      if (existingUser) {
        throw new Error('User already exists with this email address');
      }

      // Create new user record
      const name = normalizedEmail.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      const newUser = {
        passwordHash: password,
        name: formattedName,
        preferredLanguage: 'Python',
        hasCompletedOnboarding: false,
        progress: [],
      };

      await saveLocalUser(normalizedEmail, newUser);

      const payload = {
        sub: `email_${Date.now()}`,
        name: formattedName,
        email: normalizedEmail,
      };
      const header = { alg: 'none', typ: 'JWT' };
      const base64UrlEncode = (str: string): string => {
        const wa = CryptoJS.enc.Utf8.parse(str);
        let encoded = CryptoJS.enc.Base64.stringify(wa);
        encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        return encoded;
      };
      const idToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.mock_signature`;

      return {
        accessToken: `mock_access_token_${Date.now()}`,
        idToken,
        name: formattedName,
        preferredLanguage: 'Python',
        hasCompletedOnboarding: false,
        progress: [],
      };
    } else {
      // Sign In
      if (!existingUser) {
        throw new Error('No account found with this email address');
      }

      if (existingUser.passwordHash !== password) {
        throw new Error('Incorrect password');
      }

      const payload = {
        sub: existingUser.email,
        name: existingUser.name,
        email: existingUser.email,
      };
      const header = { alg: 'none', typ: 'JWT' };
      const base64UrlEncode = (str: string): string => {
        const wa = CryptoJS.enc.Utf8.parse(str);
        let encoded = CryptoJS.enc.Base64.stringify(wa);
        encoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        return encoded;
      };
      const idToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.mock_signature`;

      return {
        accessToken: `mock_access_token_${Date.now()}`,
        idToken,
        name: existingUser.name,
        preferredLanguage: existingUser.preferredLanguage,
        hasCompletedOnboarding: existingUser.hasCompletedOnboarding,
        progress: existingUser.progress || [],
      };
    }
  } catch (error) {
    console.error('Email authentication simulation failed:', error);
    throw error;
  }
};

