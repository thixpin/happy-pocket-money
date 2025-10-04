import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(userId: string, facebookId: string): TokenPair {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    facebookId
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions);
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  } as jwt.SignOptions);
  
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function refreshToken(refreshToken: string): TokenPair {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
    return generateTokens(payload.userId, payload.facebookId);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }
  
  return parts[1];
}
