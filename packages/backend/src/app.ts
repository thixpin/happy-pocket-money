import express from 'express';
import cors from 'cors';
import * as qs from 'qs';
import { AuthController } from './controllers/authController';
import { GiveawayController } from './controllers/giveawayController';
import { authenticateToken, optionalAuth } from './middleware/auth';

const app = express();
const authController = new AuthController();
const giveawayController = new GiveawayController();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ 
  extended: true,
  limit: '5mb',
  parameterLimit: 10000,
}));
app.set('query parser', (str: string) => qs.parse(str));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/auth/facebook', authController.facebookLogin.bind(authController));
app.post('/auth/facebook/callback', authController.facebookCallback.bind(authController));
app.get('/auth/verify', authenticateToken, authController.verifyToken.bind(authController));
app.post('/auth/refresh', authController.refreshToken.bind(authController));

// Giveaway routes
app.post('/giveaways', authenticateToken, giveawayController.createGiveaway.bind(giveawayController));
app.get('/giveaways/my-giveaways', authenticateToken, giveawayController.getUserGiveaways.bind(giveawayController));
app.get('/giveaways/:hash', optionalAuth, giveawayController.getGiveaway.bind(giveawayController));
app.post('/giveaways/:hash/participate', authenticateToken, giveawayController.participateInGiveaway.bind(giveawayController));
app.get('/giveaways/:hash/dashboard', authenticateToken, giveawayController.getDashboard.bind(giveawayController));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });

  next();
});

// 404 handler (Express 5 compatible catch-all)
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

export default app;
