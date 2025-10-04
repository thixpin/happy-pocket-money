import { DynamoDB } from 'aws-sdk';
import { User, Giveaway, Participant } from '../types';

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.USE_LOCAL_DYNAMODB === 'true' && {
    endpoint: process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:8000'
  })
});

const USERS_TABLE = process.env.USERS_TABLE || 'thadingyut-users';
const GIVEAWAYS_TABLE = process.env.GIVEAWAYS_TABLE || 'thadingyut-giveaways';

export class DatabaseService {
  // User operations
  async createUser(user: User): Promise<User> {
    const params = {
      TableName: USERS_TABLE,
      Item: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString()
      }
    };
    
    await dynamoDB.put(params).promise();
    return user;
  }
  
  async getUserById(id: string): Promise<User | null> {
    const params = {
      TableName: USERS_TABLE,
      Key: { id }
    };
    
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return null;
    }
    
    return {
      ...result.Item,
      createdAt: new Date(result.Item.createdAt),
      lastLoginAt: new Date(result.Item.lastLoginAt)
    } as User;
  }
  
  async getUserByFacebookId(facebookId: string): Promise<User | null> {
    const params = {
      TableName: USERS_TABLE,
      IndexName: 'facebookId-index',
      KeyConditionExpression: 'facebookId = :facebookId',
      ExpressionAttributeValues: {
        ':facebookId': facebookId
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return null;
    }
    
    const user = result.Items[0];
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: new Date(user.lastLoginAt)
    } as User;
  }
  
  async updateUserLastLogin(id: string): Promise<void> {
    const params = {
      TableName: USERS_TABLE,
      Key: { id },
      UpdateExpression: 'SET lastLoginAt = :lastLoginAt',
      ExpressionAttributeValues: {
        ':lastLoginAt': new Date().toISOString()
      }
    };
    
    await dynamoDB.update(params).promise();
  }
  
  // Giveaway operations
  async createGiveaway(giveaway: Giveaway): Promise<Giveaway> {
    const params = {
      TableName: GIVEAWAYS_TABLE,
      Item: {
        ...giveaway,
        createdAt: giveaway.createdAt.toISOString(),
        expiresAt: giveaway.expiresAt?.toISOString(),
        participants: giveaway.participants.map(p => ({
          ...p,
          participatedAt: p.participatedAt.toISOString()
        }))
      }
    };
    
    await dynamoDB.put(params).promise();
    return giveaway;
  }
  
  async getGiveawayByHash(hash: string): Promise<Giveaway | null> {
    const params = {
      TableName: GIVEAWAYS_TABLE,
      IndexName: 'hash-index',
      KeyConditionExpression: '#hash = :hash',
      ExpressionAttributeNames: {
        '#hash': 'hash'
      },
      ExpressionAttributeValues: {
        ':hash': hash
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return null;
    }
    
    const giveaway = result.Items[0];
    return {
      ...giveaway,
      createdAt: new Date(giveaway.createdAt),
      expiresAt: giveaway.expiresAt ? new Date(giveaway.expiresAt) : undefined,
      participants: giveaway.participants.map((p: any) => ({
        ...p,
        participatedAt: new Date(p.participatedAt)
      }))
    } as Giveaway;
  }
  
  async updateGiveaway(giveaway: Giveaway): Promise<Giveaway> {
    const params = {
      TableName: GIVEAWAYS_TABLE,
      Key: { id: giveaway.id },
      UpdateExpression: 'SET participants = :participants, totalDistributed = :totalDistributed, #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':participants': giveaway.participants.map(p => ({
          ...p,
          participatedAt: p.participatedAt.toISOString()
        })),
        ':totalDistributed': giveaway.totalDistributed,
        ':status': giveaway.status
      }
    };
    
    await dynamoDB.update(params).promise();
    return giveaway;
  }

  async addParticipantAtomically(
    giveawayId: string, 
    participant: Participant, 
    expectedParticipantCount: number
  ): Promise<{ success: boolean; giveaway?: Giveaway; error?: string }> {
    try {
      const params = {
        TableName: GIVEAWAYS_TABLE,
        Key: { id: giveawayId },
        UpdateExpression: 'SET participants = list_append(participants, :participant), totalDistributed = totalDistributed + :portion',
        ConditionExpression: 'size(participants) = :expectedCount AND #status = :activeStatus',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':participant': [{
            ...participant,
            participatedAt: participant.participatedAt.toISOString()
          }],
          ':portion': participant.portion,
          ':expectedCount': expectedParticipantCount,
          ':activeStatus': 'active'
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await dynamoDB.update(params).promise();
      
      if (!result.Attributes) {
        throw new Error('Failed to update giveaway');
      }
      
      // Convert the returned item back to Giveaway format
      const updatedGiveaway = {
        ...result.Attributes,
        createdAt: new Date(result.Attributes.createdAt),
        expiresAt: result.Attributes.expiresAt ? new Date(result.Attributes.expiresAt) : undefined,
        participants: result.Attributes.participants.map((p: any) => ({
          ...p,
          participatedAt: new Date(p.participatedAt)
        }))
      } as Giveaway;

      return { success: true, giveaway: updatedGiveaway };
    } catch (error: any) {
      if (error.code === 'ConditionalCheckFailedException') {
        return { 
          success: false, 
          error: 'Giveaway state has changed. Please try again.' 
        };
      }
      throw error;
    }
  }
  
  async getGiveawaysByGiverId(giverId: string): Promise<Giveaway[]> {
    const params = {
      TableName: GIVEAWAYS_TABLE,
      IndexName: 'giverId-index',
      KeyConditionExpression: 'giverId = :giverId',
      ExpressionAttributeValues: {
        ':giverId': giverId
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items) {
      return [];
    }
    
    return result.Items.map(giveaway => ({
      ...giveaway,
      createdAt: new Date(giveaway.createdAt),
      expiresAt: giveaway.expiresAt ? new Date(giveaway.expiresAt) : undefined,
      participants: giveaway.participants.map((p: any) => ({
        ...p,
        participatedAt: new Date(p.participatedAt)
      }))
    })) as Giveaway[];
  }

  async getGiveawaysByParticipantId(userId: string): Promise<Giveaway[]> {
    const params = {
      TableName: GIVEAWAYS_TABLE,
      FilterExpression: 'contains(participants, :userId)',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    
    return result.Items.map(giveaway => ({
      ...giveaway,
      createdAt: new Date(giveaway.createdAt),
      expiresAt: giveaway.expiresAt ? new Date(giveaway.expiresAt) : undefined,
      participants: giveaway.participants.map((p: any) => ({
        ...p,
        participatedAt: new Date(p.participatedAt)
      }))
    })) as Giveaway[];
  }

  async getUserGiveaways(userId: string): Promise<{
    created: Giveaway[];
    participated: Array<{
      giveaway: Giveaway;
      participant: Participant;
    }>;
  }> {
    // Get giveaways created by user
    const createdGiveaways = await this.getGiveawaysByGiverId(userId);
    
    // Get all giveaways and filter for participations
    const allGiveaways = await this.getAllGiveaways();
    const participatedGiveaways: Array<{
      giveaway: Giveaway;
      participant: Participant;
    }> = [];
    
    for (const giveaway of allGiveaways) {
      const participant = giveaway.participants.find(p => p.userId === userId);
      if (participant) {
        participatedGiveaways.push({
          giveaway,
          participant
        });
      }
    }
    
    return {
      created: createdGiveaways,
      participated: participatedGiveaways
    };
  }

  async getAllGiveaways(): Promise<Giveaway[]> {
    const params = {
      TableName: GIVEAWAYS_TABLE
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    
    return result.Items.map(giveaway => ({
      ...giveaway,
      createdAt: new Date(giveaway.createdAt),
      expiresAt: giveaway.expiresAt ? new Date(giveaway.expiresAt) : undefined,
      participants: giveaway.participants.map((p: any) => ({
        ...p,
        participatedAt: new Date(p.participatedAt)
      }))
    })) as Giveaway[];
  }
}
