// Frontend types (decoupled from shared)

export enum PaymentMethod {
  WAVE = 'wave',
  KPAY = 'kpay',
  AYAPAY = 'ayapay',
  A_PLUS_WALLET = 'a_plus_wallet',
  CB_PAY = 'cb_pay'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface Giveaway {
  id: string;
  hash: string;
  budget: number;
  receiverCount: number;
  paymentMethods: PaymentMethod[];
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  participantsCount?: number;
  remainingSlots?: number;
  url?: string;
  giver?: {
    name: string;
    profilePicture?: string;
    profileLink: string;
  };
}

export interface Participant {
  userId: string;
  userName: string;
  profilePicture?: string;
  portion: number;
  participatedAt: string;
  profileLink: string;
}

export interface ParticipantResult {
  portion: number;
  profileLink: string;
  participatedAt: string;
}

export interface DashboardData {
  totalDistributed: number;
  participants: Participant[];
}

export interface GiveawayResponse {
  giveaway: Giveaway;
  participant?: ParticipantResult;
  dashboard?: DashboardData;
}

export interface ParticipateRequest {
  userName: string;
}

export interface CreateGiveawayRequest {
  budget: number;
  receiverCount: number;
  paymentMethods: PaymentMethod[];
}

export interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}
