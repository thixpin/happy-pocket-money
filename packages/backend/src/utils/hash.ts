import * as crypto from 'crypto';

/**
 * Generate cryptographically secure hash for giveaway URLs
 * Uses a combination of random bytes and timestamp for uniqueness
 */
export function generateSecureHash(): string {
  // Generate 8 random bytes and convert to base64
  const randomBytes = crypto.randomBytes(8);
  const timestamp = Date.now().toString(36);
  
  // Combine random bytes with timestamp for uniqueness
  const combined = randomBytes.toString('base64') + timestamp;
  
  // Create hash and take first 12 characters for URL-friendly format
  const hash = crypto.createHash('sha256').update(combined).digest('base64');
  
  // Remove special characters and take first 12 characters
  return hash.replace(/[+/=]/g, '').substring(0, 12);
}

/**
 * Validate hash format and length
 */
export function validateHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  
  // Check length (should be 12 characters)
  if (hash.length !== 12) {
    return false;
  }
  
  // Check if contains only alphanumeric characters
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(hash);
}

/**
 * Generate URL-friendly hash with collision detection
 */
export function generateUniqueHash(existingHashes: Set<string>): string {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const hash = generateSecureHash();
    
    if (!existingHashes.has(hash)) {
      return hash;
    }
    
    attempts++;
  }
  
  // Fallback: add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const fallbackHash = generateSecureHash() + timestamp.substring(0, 4);
  return fallbackHash.substring(0, 12);
}
