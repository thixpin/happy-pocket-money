import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    facebookId: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    
    req.user = {
      userId: payload.userId,
      facebookId: payload.facebookId
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      const payload = verifyToken(token);
      
      req.user = {
        userId: payload.userId,
        facebookId: payload.facebookId
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
}
