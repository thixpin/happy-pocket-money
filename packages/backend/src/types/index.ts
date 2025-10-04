// Backend type definitions (formerly from shared)

export enum PaymentMethod {
  WAVE = 'wave',
  KPAY = 'kpay',
  AYAPAY = 'ayapay',
  A_PLUS_WALLET = 'a_plus_wallet',
  CB_PAY = 'cb_pay'
}

export interface User {
  id: string;
  facebookId: string;
  name: string;
  email?: string;
  profilePicture?: string;
  profileLink?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Participant {
  userId: string;
  userName: string;
  profilePicture?: string;
  portion: number;
  participatedAt: Date;
  profileLink: string;
}

export interface Giveaway {
  id: string;
  hash: string;
  giverId: string;
  budget: number;
  receiverCount: number;
  paymentMethods: PaymentMethod[];
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  participants: Participant[];
  totalDistributed: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  facebookId: string;
  iat: number;
  exp: number;
}
