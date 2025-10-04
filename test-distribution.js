// Test script to demonstrate the improved fair distribution algorithm for Myanmar Kyat
const { calculateSinglePortion, calculateRandomDistribution, getDistributionStats } = require('./packages/backend/dist/utils/distribution.js');

console.log('Testing Fair Distribution Algorithm for Myanmar Kyat\n');

// Test case 1: Simulate 5 participants joining one by one
console.log('=== Test Case 1: Sequential Participation ===');
const budget = 10000; // 10,000 kyat
const totalParticipants = 5;
let alreadyDistributed = 0;

console.log(`Budget: ${budget.toLocaleString()} kyat, Total Participants: ${totalParticipants}\n`);

for (let i = 0; i < totalParticipants; i++) {
  const portion = calculateSinglePortion(budget, totalParticipants, i, alreadyDistributed);
  alreadyDistributed += portion;
  console.log(`Participant ${i + 1}: ${portion.toLocaleString()} kyat (Remaining: ${(budget - alreadyDistributed).toLocaleString()} kyat)`);
}

console.log(`\nTotal Distributed: ${alreadyDistributed.toLocaleString()} kyat`);
console.log(`Remaining: ${(budget - alreadyDistributed).toLocaleString()} kyat\n`);

// Test case 2: Compare with batch distribution
console.log('=== Test Case 2: Batch Distribution ===');
const batchResult = calculateRandomDistribution(budget, totalParticipants);
console.log('Batch distribution portions:', batchResult.portions.map(p => p.toLocaleString() + ' kyat'));
console.log('Total distributed:', batchResult.totalDistributed.toLocaleString(), 'kyat');
console.log('Remaining:', batchResult.remaining.toLocaleString(), 'kyat');

// Test case 3: Multiple runs to show consistency
console.log('\n=== Test Case 3: Multiple Runs (showing fairness) ===');
for (let run = 1; run <= 3; run++) {
  console.log(`\nRun ${run}:`);
  let distributed = 0;
  for (let i = 0; i < totalParticipants; i++) {
    const portion = calculateSinglePortion(budget, totalParticipants, i, distributed);
    distributed += portion;
    console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat`);
  }
  console.log(`  Total: ${distributed.toLocaleString()} kyat`);
}

// Test case 4: Test with different budget amounts
console.log('\n=== Test Case 4: Different Budget Amounts ===');
const testBudgets = [1000, 5000, 15000, 25000];
const testParticipants = 3;

testBudgets.forEach(budget => {
  console.log(`\nBudget: ${budget.toLocaleString()} kyat, Participants: ${testParticipants}`);
  let distributed = 0;
  for (let i = 0; i < testParticipants; i++) {
    const portion = calculateSinglePortion(budget, testParticipants, i, distributed);
    distributed += portion;
    console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat`);
  }
  console.log(`  Total: ${distributed.toLocaleString()} kyat`);
});

// Test case 5: Verify all amounts end with 0
console.log('\n=== Test Case 5: Verify All Amounts End with 0 ===');
const testBudget = 12345; // Non-round number
const testParticipants2 = 4;
let distributed2 = 0;

console.log(`Budget: ${testBudget.toLocaleString()} kyat, Participants: ${testParticipants2}`);
for (let i = 0; i < testParticipants2; i++) {
  const portion = calculateSinglePortion(testBudget, testParticipants2, i, distributed2);
  distributed2 += portion;
  const endsWithZero = portion % 10 === 0;
  console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat (ends with 0: ${endsWithZero})`);
}
console.log(`  Total: ${distributed2.toLocaleString()} kyat`);

// Test case 6: Distribution statistics
console.log('\n=== Test Case 6: Distribution Statistics ===');
const statsBudget = 20000;
const statsParticipants = 6;
const statsResult = calculateRandomDistribution(statsBudget, statsParticipants);
const stats = getDistributionStats(statsResult.portions);

console.log(`Budget: ${statsBudget.toLocaleString()} kyat, Participants: ${statsParticipants}`);
console.log(`Portions: ${statsResult.portions.map(p => p.toLocaleString() + ' kyat').join(', ')}`);
console.log(`Statistics:`);
console.log(`  Min: ${stats.min.toLocaleString()} kyat`);
console.log(`  Max: ${stats.max.toLocaleString()} kyat`);
console.log(`  Average: ${Math.round(stats.average).toLocaleString()} kyat`);
console.log(`  Total: ${stats.total.toLocaleString()} kyat`);

// Test case 7: Edge cases
console.log('\n=== Test Case 7: Edge Cases ===');

// Very small budget
console.log('\nSmall budget test (1000 kyat, 3 participants):');
let smallDistributed = 0;
for (let i = 0; i < 3; i++) {
  const portion = calculateSinglePortion(1000, 3, i, smallDistributed);
  smallDistributed += portion;
  console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat`);
}
console.log(`  Total: ${smallDistributed.toLocaleString()} kyat`);

// Very small budget with many participants
console.log('\nSmall budget test (1000 kyat, 20 participants):');
let smallDistributed2 = 0;
for (let i = 0; i < 20; i++) {
  const portion = calculateSinglePortion(1000, 20, i, smallDistributed2);
  smallDistributed2 += portion;
  console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat`);
}
console.log(`  Total: ${smallDistributed2.toLocaleString()} kyat`);

// Large budget
console.log('\nLarge budget test (1,000,000 kyat, 5 participants):');
let largeDistributed = 0;
for (let i = 0; i < 5; i++) {
  const portion = calculateSinglePortion(1000000, 5, i, largeDistributed);
  largeDistributed += portion;
  console.log(`  Participant ${i + 1}: ${portion.toLocaleString()} kyat`);
}
console.log(`  Total: ${largeDistributed.toLocaleString()} kyat`);

console.log('\n=== Test Complete ===');
