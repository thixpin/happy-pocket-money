/**
 * Fair random distribution algorithm for pocket money
 * Ensures total distributed amount equals original budget exactly
 */

export interface DistributionResult {
  portions: number[];
  totalDistributed: number;
  remaining: number;
}

/**
 * Calculate random distribution for all participants at once
 * Uses weighted random allocation to ensure fair distribution
 */
export function calculateRandomDistribution(
  budget: number,
  receiverCount: number,
  alreadyDistributed: number = 0
): DistributionResult {
  // Validate inputs
  if (budget <= 0) {
    throw new Error('Budget must be positive');
  }
  
  if (receiverCount <= 0) {
    throw new Error('Receiver count must be positive');
  }
  
  if (alreadyDistributed < 0 || alreadyDistributed > budget) {
    throw new Error('Already distributed amount is invalid');
  }
  
  const remainingBudget = budget - alreadyDistributed;
  
  // Handle edge cases
  if (remainingBudget <= 0) {
    return {
      portions: [],
      totalDistributed: alreadyDistributed,
      remaining: 0
    };
  }
  
  // For single receiver, give all remaining budget
  if (receiverCount === 1) {
    return {
      portions: [remainingBudget],
      totalDistributed: budget,
      remaining: 0
    };
  }
  
  // Apply multiplier for better precision with large numbers
  const multiplier = calculateMultiplier(budget);
  const scaledBudget = budget / multiplier;
  const scaledAlreadyDistributed = alreadyDistributed / multiplier;
  const scaledRemainingBudget = scaledBudget - scaledAlreadyDistributed;
  
  // Generate random weights for each receiver
  const weights = generateRandomWeights(receiverCount);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Allocate portions based on weights
  const portions: number[] = [];
  let totalAllocated = 0;
  
  for (let i = 0; i < receiverCount - 1; i++) {
    const portion = Math.floor((weights[i] / totalWeight) * scaledRemainingBudget);
    const scaledPortion = Math.max(1, portion) * multiplier;
    portions.push(scaledPortion);
    totalAllocated += scaledPortion;
  }
  
  // Last receiver gets remaining amount to ensure exact total
  const lastPortion = remainingBudget - totalAllocated;
  portions.push(Math.max(1, lastPortion));
  
  // Verify total
  const totalDistributed = portions.reduce((sum, portion) => sum + portion, 0) + alreadyDistributed;
  
  return {
    portions,
    totalDistributed,
    remaining: budget - totalDistributed
  };
}

/**
 * Generate random weights for fair distribution
 */
function generateRandomWeights(count: number): number[] {
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    weights.push(Math.random());
  }
  return weights;
}

/**
 * Calculate a fair portion for a single participant in a giveaway
 * Uses dynamic percentage ranges based on remaining slots to ensure fairness
 */
export function calculateSinglePortion(
  budget: number,
  receiverCount: number,
  currentParticipantCount: number,
  alreadyDistributed: number = 0
): number {
  // Validate inputs
  if (currentParticipantCount >= receiverCount) {
    throw new Error('Maximum receiver count reached');
  }
  
  const remainingBudget = budget - alreadyDistributed;
  const remainingSlots = receiverCount - currentParticipantCount;
  
  if (remainingSlots <= 0) {
    throw new Error('No remaining slots for participation');
  }
  
  // Last participant gets all remaining budget
  if (remainingSlots === 1) {
    return remainingBudget;
  }
  
  // Apply multiplier for better precision with large numbers
  const multiplier = calculateMultiplier(budget);
  const scaledBudget = budget / multiplier;
  const scaledAlreadyDistributed = alreadyDistributed / multiplier;
  const scaledRemainingBudget = scaledBudget - scaledAlreadyDistributed;
  
  // Calculate dynamic min/max percentages based on remaining slots
  const { minPercentage, maxPercentage } = calculatePercentageRanges(remainingSlots);
  
  // Calculate portion boundaries
  const minPortion = Math.max(1, Math.floor(scaledRemainingBudget * minPercentage));
  const maxPortion = calculateMaxPortion(scaledRemainingBudget, maxPercentage, remainingSlots);
  
  // Generate random portion within fair range
  const randomPortion = Math.floor(Math.random() * (maxPortion - minPortion + 1)) + minPortion;
  
  // Ensure we don't exceed remaining budget and scale back up
  const finalPortion = Math.min(randomPortion, scaledRemainingBudget - (remainingSlots - 1));
  return finalPortion * multiplier;
}

/**
 * Calculate multiplier based on budget size for better precision
 */
function calculateMultiplier(budget: number): number {
  if (budget >= 100000) return 1000;
  if (budget >= 10000) return 100;
  if (budget >= 1000) return 10;
  return 1;
}

/**
 * Calculate dynamic percentage ranges based on remaining slots
 * Fewer remaining slots = higher allowed percentages for fairness
 */
function calculatePercentageRanges(remainingSlots: number): { minPercentage: number; maxPercentage: number } {
  let minPercentage: number;
  let maxPercentage: number;
  
  if (remainingSlots <= 2) {
    // Only 2-3 slots left: allow higher percentages
    minPercentage = 0.15; // 15%
    maxPercentage = 0.5;  // 50%
  } else if (remainingSlots <= 4) {
    // 3-4 slots left: moderate percentages
    minPercentage = 0.1;  // 10%
    maxPercentage = 0.4;  // 40%
  } else {
    // 5+ slots left: lower percentages for fairness
    minPercentage = 0.05; // 5%
    maxPercentage = 0.25; // 25%
  }
  
  return { minPercentage, maxPercentage };
}

/**
 * Calculate maximum portion ensuring enough budget remains for other participants
 */
function calculateMaxPortion(remainingBudget: number, maxPercentage: number, remainingSlots: number): number {
  let maxPortion = Math.floor(remainingBudget * maxPercentage);
  
  // Ensure we leave enough budget for remaining participants (minimum 1 each)
  const minRequiredForOthers = remainingSlots - 1;
  if (remainingBudget - maxPortion < minRequiredForOthers) {
    maxPortion = remainingBudget - minRequiredForOthers;
  }
  
  return maxPortion;
}

/**
 * Validate that the sum of portions equals the original budget
 */
export function validateDistribution(
  budget: number,
  portions: number[]
): boolean {
  const total = portions.reduce((sum, portion) => sum + portion, 0);
  return total === budget;
}

/**
 * Calculate distribution statistics for analysis
 */
export function getDistributionStats(portions: number[]): {
  min: number;
  max: number;
  average: number;
  total: number;
  variance: number;
  standardDeviation: number;
} {
  if (portions.length === 0) {
    return { 
      min: 0, 
      max: 0, 
      average: 0, 
      total: 0, 
      variance: 0, 
      standardDeviation: 0 
    };
  }
  
  const total = portions.reduce((sum, portion) => sum + portion, 0);
  const average = total / portions.length;
  
  // Calculate variance and standard deviation
  const variance = portions.reduce((sum, portion) => {
    const diff = portion - average;
    return sum + (diff * diff);
  }, 0) / portions.length;
  
  const standardDeviation = Math.sqrt(variance);
  
  return { 
    min: Math.min(...portions),
    max: Math.max(...portions),
    average: Math.round(average * 100) / 100, // Round to 2 decimal places
    total,
    variance: Math.round(variance * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100
  };
}
