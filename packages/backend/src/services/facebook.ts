import axios from 'axios';
import { User } from '../types';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  link?: string;
}

export class FacebookService {
  async verifyAccessToken(accessToken: string): Promise<FacebookUserInfo> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,picture,link`
      );
      
      return response.data;
    } catch (error) {
      throw new Error('Invalid Facebook access token');
    }
  }
  
  async getAppAccessToken(): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&grant_type=client_credentials`
      );
      
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get Facebook app access token');
    }
  }
  
  async verifyUserAccessToken(userAccessToken: string, appAccessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${appAccessToken}`
      );
      
      const data = response.data.data;
      return data.is_valid && data.app_id === FACEBOOK_APP_ID;
    } catch (error) {
      return false;
    }
  }
  
  createUserFromFacebookInfo(facebookInfo: FacebookUserInfo): User {
    return {
      id: facebookInfo.id,
      facebookId: facebookInfo.id,
      name: facebookInfo.name,
      // Do not store email; app does not request it
      email: undefined,
      profilePicture: facebookInfo.picture?.data?.url,
      profileLink: facebookInfo.link,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
  }
  
}
