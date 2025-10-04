import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DatabaseService } from '../services/database';
import { FacebookService } from '../services/facebook';
import { generateSecureHash, validateHash } from '../utils/hash';
import { calculateSinglePortion } from '../utils/distribution';
import { validateCreateGiveawayRequest, validateParticipateRequest, ValidationError } from '../utils/validation';
import { randomUUID } from 'crypto';
import { Giveaway, Participant } from '../types';

const databaseService = new DatabaseService();
const facebookService = new FacebookService();

export class GiveawayController {
  async createGiveaway(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Validate request data
      validateCreateGiveawayRequest(req.body);
      
      const { budget, receiverCount, paymentMethods } = req.body;
      
      // Generate unique hash
      const hash = generateSecureHash();
      
      // Create giveaway
      const giveaway: Giveaway = {
        id: randomUUID(),
        hash,
        giverId: user.userId,
        budget,
        receiverCount,
        paymentMethods,
        status: 'active',
        createdAt: new Date(),
        participants: [],
        totalDistributed: 0
      };
      
      await databaseService.createGiveaway(giveaway);
      
      res.status(201).json({
        giveaway: {
          id: giveaway.id,
          hash: giveaway.hash,
          budget: giveaway.budget,
          receiverCount: giveaway.receiverCount,
          paymentMethods: giveaway.paymentMethods,
          status: giveaway.status,
          createdAt: giveaway.createdAt,
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/giveaway/${hash}`
        }
      });
      
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            field: error.field
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create giveaway',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async getGiveaway(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { hash } = req.params;
      
      if (!validateHash(hash)) {
        res.status(404).json({
          error: {
            code: 'INVALID_HASH',
            message: 'Invalid giveaway hash'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const giveaway = await databaseService.getGiveawayByHash(hash);
      
      if (!giveaway) {
        res.status(404).json({
          error: {
            code: 'GIVEAWAY_NOT_FOUND',
            message: 'Giveaway not found'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Allow viewing completed giveaways, but not expired ones
      if (giveaway.status === 'expired') {
        res.status(400).json({
          error: {
            code: 'GIVEAWAY_EXPIRED',
            message: 'Giveaway has expired'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check if user has already participated
      const userParticipation = req.user ? giveaway.participants.find(p => p.userId === req.user!.userId) : undefined;
      
      // Get giver details
      const giverDetails = await databaseService.getUserById(giveaway.giverId);
      
      const response: any = {
        giveaway: {
          id: giveaway.id,
          budget: giveaway.budget,
          receiverCount: giveaway.receiverCount,
          paymentMethods: giveaway.paymentMethods,
          participantsCount: giveaway.participants.length,
          remainingSlots: giveaway.receiverCount - giveaway.participants.length,
          status: giveaway.status,
          createdAt: giveaway.createdAt,
          giver: {
            name: giverDetails?.name || 'Unknown',
            profilePicture: giverDetails?.profilePicture,
            profileLink: giverDetails?.profileLink || `https://www.facebook.com/${giveaway.giverId}`
          }
        }
      };
      
      // If user has participated, include their participation details
      if (userParticipation) {
        response.participant = {
          portion: userParticipation.portion,
          profileLink: userParticipation.profileLink,
          participatedAt: userParticipation.participatedAt
        };
      }
      
      // For completed giveaways, include all participants with their details
      if (giveaway.status === 'completed') {
        response.dashboard = {
          totalDistributed: giveaway.totalDistributed,
          participants: giveaway.participants.map(p => ({
            userId: p.userId,
            userName: p.userName,
            profilePicture: p.profilePicture,
            portion: p.portion,
            participatedAt: p.participatedAt,
            profileLink: p.profileLink
          }))
        };
      }
      
      res.json(response);
      
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get giveaway',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async participateInGiveaway(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const { hash } = req.params;
      
      if (!validateHash(hash)) {
        res.status(404).json({
          error: {
            code: 'INVALID_HASH',
            message: 'Invalid giveaway hash'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Validate participation request
      validateParticipateRequest(req.body);
      
      // Check if user has already participated in any giveaway
      const userGiveaways = await databaseService.getGiveawaysByParticipantId(user.userId);
      if (userGiveaways.length > 0) {
        res.status(400).json({
          error: {
            code: 'ALREADY_PARTICIPATED_IN_ANOTHER',
            message: 'You have already participated in another giveaway. You can only participate in one giveaway at a time.'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const giveaway = await databaseService.getGiveawayByHash(hash);
      
      if (!giveaway) {
        res.status(404).json({
          error: {
            code: 'GIVEAWAY_NOT_FOUND',
            message: 'Giveaway not found'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check if user is trying to participate in their own giveaway
      if (giveaway.giverId === user.userId) {
        res.status(400).json({
          error: {
            code: 'CANNOT_PARTICIPATE_OWN_GIVEAWAY',
            message: 'You cannot participate in your own giveaway'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      if (giveaway.status !== 'active') {
        res.status(400).json({
          error: {
            code: 'GIVEAWAY_INACTIVE',
            message: 'Giveaway is no longer active'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check if user already participated
      const existingParticipant = giveaway.participants.find(p => p.userId === user.userId);
      if (existingParticipant) {
        res.status(400).json({
          error: {
            code: 'ALREADY_PARTICIPATED',
            message: 'You have already participated in this giveaway'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check if giveaway is full
      if (giveaway.participants.length >= giveaway.receiverCount) {
        res.status(400).json({
          error: {
            code: 'GIVEAWAY_FULL',
            message: 'Giveaway is full'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Calculate portion based on current state
      const currentParticipantCount = giveaway.participants.length;
      const portion = calculateSinglePortion(
        giveaway.budget,
        giveaway.receiverCount,
        currentParticipantCount,
        giveaway.totalDistributed
      );
      
      // Get user details to include profile picture
      const userDetails = await databaseService.getUserById(user.userId);
      
      // Get giver details to include profile link
      const giverDetails = await databaseService.getUserById(giveaway.giverId);
      
      // Create participant
      const participant: Participant = {
        userId: user.userId,
        userName: req.body.userName,
        profilePicture: userDetails?.profilePicture,
        portion,
        participatedAt: new Date(),
        profileLink: giverDetails?.profileLink || `https://www.facebook.com/${giveaway.giverId}`
      };
      
      // Atomically add participant to prevent race conditions
      const atomicResult = await databaseService.addParticipantAtomically(
        giveaway.id,
        participant,
        currentParticipantCount
      );
      
      if (!atomicResult.success) {
        res.status(409).json({
          error: {
            code: 'CONCURRENT_MODIFICATION',
            message: atomicResult.error || 'Giveaway state has changed. Please try again.'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const updatedGiveaway = atomicResult.giveaway!;
      
      // Check if giveaway is now complete and update status if needed
      if (updatedGiveaway.participants.length >= updatedGiveaway.receiverCount && updatedGiveaway.status === 'active') {
        updatedGiveaway.status = 'completed';
        await databaseService.updateGiveaway(updatedGiveaway);
      }
      
      res.json({
        participant: {
          portion: participant.portion,
          profileLink: participant.profileLink,
          participatedAt: participant.participatedAt
        },
        giveaway: {
          participantsCount: updatedGiveaway.participants.length,
          remainingSlots: updatedGiveaway.receiverCount - updatedGiveaway.participants.length,
          status: updatedGiveaway.status
        }
      });
      
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            field: error.field
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to participate in giveaway',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
  
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const { hash } = req.params;
      
      if (!validateHash(hash)) {
        res.status(404).json({
          error: {
            code: 'INVALID_HASH',
            message: 'Invalid giveaway hash'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const giveaway = await databaseService.getGiveawayByHash(hash);
      
      if (!giveaway) {
        res.status(404).json({
          error: {
            code: 'GIVEAWAY_NOT_FOUND',
            message: 'Giveaway not found'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Check if user is the giver
      if (giveaway.giverId !== user.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Only the giver can view the dashboard'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      // Get giver details
      const giverDetails = await databaseService.getUserById(giveaway.giverId);
      
      res.json({
        giveaway: {
          id: giveaway.id,
          hash: giveaway.hash,
          budget: giveaway.budget,
          receiverCount: giveaway.receiverCount,
          paymentMethods: giveaway.paymentMethods,
          status: giveaway.status,
          totalDistributed: giveaway.totalDistributed,
          createdAt: giveaway.createdAt,
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/giveaway/${giveaway.hash}`,
          giver: {
            name: giverDetails?.name || 'Unknown',
            profilePicture: giverDetails?.profilePicture,
            profileLink: giverDetails?.profileLink || `https://www.facebook.com/${giveaway.giverId}`
          }
        },
        participants: giveaway.participants.map(p => ({
          userName: p.userName,
          profilePicture: p.profilePicture,
          portion: p.portion,
          participatedAt: p.participatedAt,
          profileLink: p.profileLink
        }))
      });
      
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get dashboard',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }

  async getUserGiveaways(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user } = req;
      if (!user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        });
        return;
      }
      
      const userGiveaways = await databaseService.getUserGiveaways(user.userId);
      
      res.json({
        created: userGiveaways.created.map(giveaway => ({
          id: giveaway.id,
          hash: giveaway.hash,
          budget: giveaway.budget,
          receiverCount: giveaway.receiverCount,
          paymentMethods: giveaway.paymentMethods,
          status: giveaway.status,
          participantsCount: giveaway.participants.length,
          remainingSlots: giveaway.receiverCount - giveaway.participants.length,
          totalDistributed: giveaway.totalDistributed,
          createdAt: giveaway.createdAt
        })),
        participated: userGiveaways.participated.map(({ giveaway, participant }) => ({
          giveaway: {
            id: giveaway.id,
            hash: giveaway.hash,
            budget: giveaway.budget,
            receiverCount: giveaway.receiverCount,
            paymentMethods: giveaway.paymentMethods,
            status: giveaway.status,
            participantsCount: giveaway.participants.length,
            remainingSlots: giveaway.receiverCount - giveaway.participants.length,
            createdAt: giveaway.createdAt
          },
          participant: {
            userName: participant.userName,
            profilePicture: participant.profilePicture,
            portion: participant.portion,
            participatedAt: participant.participatedAt,
            profileLink: participant.profileLink
          }
        }))
      });
      
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user giveaways',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
}
