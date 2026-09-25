/**
 * Token Storage Service for LifeFix.
 *
 * Centralizes client-side JWT access token persistence.
 * Isolates browser storage access so it can be swapped for cookie-based
 * or in-memory token management in future security phases.
 *
 * Security:
 * - NEVER stores plaintext passwords or password hashes.
 * - NEVER exposes tokens in URLs or query parameters.
 */

const ACCESS_TOKEN_STORAGE_KEY = "lifefix_access_token";

/**
 * Retrieve the current JWT access token from persistent client storage.
 * Returns null if no token exists or if storage is inaccessible.
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist the active JWT access token to client storage.
 */
export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Gracefully handle storage quota or private-browsing restrictions
  }
}

/**
 * Remove the stored JWT access token from client storage upon logout or expiration.
 */
export function removeStoredToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Gracefully handle storage access issues
  }
}
