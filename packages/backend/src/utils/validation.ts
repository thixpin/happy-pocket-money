import { PaymentMethod } from '../types';

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateBudget(budget: number): void {
  if (typeof budget !== 'number' || isNaN(budget)) {
    throw new ValidationError('Budget must be a valid number', 'budget');
  }
  
  if (budget < 1000) {
    throw new ValidationError('Budget must not be less than 1000', 'budget');
  }
  
  if (!Number.isInteger(budget)) {
    throw new ValidationError('Budget must be an integer', 'budget');
  }
  
  if (budget > 10000000) {
    throw new ValidationError('Budget cannot exceed 1,000,000', 'budget');
  }
}

export function validateReceiverCount(receiverCount: number): void {
  if (typeof receiverCount !== 'number' || isNaN(receiverCount)) {
    throw new ValidationError('Receiver count must be a valid number', 'receiverCount');
  }
  
  if (!Number.isInteger(receiverCount)) {
    throw new ValidationError('Receiver count must be an integer', 'receiverCount');
  }
  
  if (receiverCount < 2) {
    throw new ValidationError('Receiver count must be at least 2', 'receiverCount');
  }
  
  if (receiverCount > 30) {
    throw new ValidationError('Receiver count cannot exceed 30', 'receiverCount');
  }
}

export function validatePaymentMethods(paymentMethods: PaymentMethod[]): void {
  if (!Array.isArray(paymentMethods)) {
    throw new ValidationError('Payment methods must be an array', 'paymentMethods');
  }
  
  if (paymentMethods.length === 0) {
    throw new ValidationError('At least one payment method must be selected', 'paymentMethods');
  }
  
  const validMethods = Object.values(PaymentMethod);
  const invalidMethods = paymentMethods.filter(method => !validMethods.includes(method));
  
  if (invalidMethods.length > 0) {
    throw new ValidationError(`Invalid payment methods: ${invalidMethods.join(', ')}`, 'paymentMethods');
  }
  
  // Check for duplicates
  const uniqueMethods = new Set(paymentMethods);
  if (uniqueMethods.size !== paymentMethods.length) {
    throw new ValidationError('Duplicate payment methods are not allowed', 'paymentMethods');
  }
}

export function validateCreateGiveawayRequest(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request data must be an object', 'request');
  }
  
  validateBudget(data.budget);
  validateReceiverCount(data.receiverCount);
  validatePaymentMethods(data.paymentMethods);
}

export function validateParticipateRequest(data: any): void {
  // No validation needed - user information comes from authenticated user
  // This function is kept for future validation needs
}
