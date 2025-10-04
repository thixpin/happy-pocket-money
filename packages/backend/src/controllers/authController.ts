import { Request, Response } from 'express';
import { FacebookService } from '../services/facebook';
import { DatabaseService } from '../services/database';
import { generateTokens } from '../utils/auth';
// import { validateCreateGiveawayRequest } from '../utils/validation';

const facebookService = new FacebookService();
const databaseService = new DatabaseService();

export class AuthController {
  async facebookLogin(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        res.status(400).json({
          error: {
            code: 'MISSING_ACCESS_TOKEN',
            message: 'Facebook access token is required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Verify Facebook access token
      const facebookUserInfo = await facebookService.verifyAccessToken(accessToken);
      
      // Check if user exists
      let user = await databaseService.getUserByFacebookId(facebookUserInfo.id);
      
      if (!user) {
        // Create new user
        const newUser = facebookService.createUserFromFacebookInfo(facebookUserInfo);
        user = await databaseService.createUser(newUser);
      } else {
        // Update last login
        await databaseService.updateUserLastLogin(user.id);
        user.lastLoginAt = new Date();
      }
      
      // Generate JWT tokens
      const tokens = generateTokens(user.id, user.facebookId);
      
      console.log('tokens', { user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      tokens});

      console.log('Successfully generated tokens');

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        tokens
      });
      
    } catch (error) {
      res.status(401).json({
        error: {
          code: 'FACEBOOK_AUTH_FAILED',
          message: 'Facebook authentication failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { user } = req as any;
      
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'No user information found'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Get user details from database
      const userDetails = await databaseService.getUserById(user.userId);
      
      if (!userDetails) {
        res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      res.json({
        user: {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.email,
          profilePicture: userDetails.profilePicture
        }
      });
      
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Import refreshToken function
      const { refreshToken: refreshTokenUtil } = await import('../utils/auth');
      const tokens = refreshTokenUtil(refreshToken);
      
      res.json({ tokens });
      
    } catch (error) {
      res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async facebookCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      
      console.log('Facebook callback received:', { code: code ? 'present' : 'missing' });
      
      if (!code) {
        res.status(400).json({
          error: {
            code: 'MISSING_AUTHORIZATION_CODE',
            message: 'Authorization code is required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check environment variables
      if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !process.env.FACEBOOK_REDIRECT_URI) {
        console.error('Missing Facebook environment variables');
        throw new Error('Facebook configuration is incomplete');
      }
      
      // Exchange authorization code for access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&code=${code}`;
      console.log('Exchanging code for token...');
      
      const tokenResponse = await fetch(tokenUrl);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('Failed to exchange authorization code for access token');
      }
      
      const tokenData = await tokenResponse.json() as { access_token: string };
      const accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error('No access token received from Facebook');
      }
      
      // Verify Facebook access token and get user info
      const facebookUserInfo = await facebookService.verifyAccessToken(accessToken);
      
      // Check if user exists
      let user = await databaseService.getUserByFacebookId(facebookUserInfo.id);
      
      if (!user) {
        // Create new user
        const newUser = facebookService.createUserFromFacebookInfo(facebookUserInfo);
        user = await databaseService.createUser(newUser);
      } else {
        // Update last login
        await databaseService.updateUserLastLogin(user.id);
        user.lastLoginAt = new Date();
      }
      
      // Generate JWT tokens
      const tokens = generateTokens(user.id, user.facebookId);
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        tokens
      });
      
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
}
