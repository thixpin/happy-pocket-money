#!/usr/bin/env node

/**
 * Test script to demonstrate the fix for concurrent giveaway participation
 * This script simulates multiple users trying to participate in the same giveaway simultaneously
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const GIVEAWAY_HASH = 'test-giveaway-hash'; // Replace with actual hash
const CONCURRENT_REQUESTS = 5;

// Sample user data
const users = [
  { userId: 'user1', userName: 'User One', accessToken: 'token1' },
  { userId: 'user2', userName: 'User Two', accessToken: 'token2' },
  { userId: 'user3', userName: 'User Three', accessToken: 'token3' },
  { userId: 'user4', userName: 'User Four', accessToken: 'token4' },
  { userId: 'user5', userName: 'User Five', accessToken: 'token5' }
];

async function participateInGiveaway(user, giveawayHash) {
  try {
    console.log(`🚀 ${user.userName} attempting to participate...`);
    
    const response = await axios.post(
      `${API_BASE_URL}/giveaways/${giveawayHash}/participate`,
      {
        userName: user.userName
      },
      {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log(`✅ ${user.userName} successfully participated!`);
    console.log(`   Portion: ${response.data.participant.portion}`);
    console.log(`   Remaining slots: ${response.data.giveaway.remainingSlots}`);
    console.log(`   Status: ${response.data.giveaway.status}`);
    
    return {
      success: true,
      user: user.userName,
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ ${user.userName} failed to participate:`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error?.message || error.response.data.message}`);
      console.log(`   Code: ${error.response.data.error?.code || 'UNKNOWN'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    return {
      success: false,
      user: user.userName,
      error: error.response?.data || error.message
    };
  }
}

async function testConcurrentParticipation() {
  console.log('🧪 Testing Concurrent Giveaway Participation Fix');
  console.log('=' .repeat(50));
  console.log(`📊 Sending ${CONCURRENT_REQUESTS} concurrent requests...`);
  console.log('');
  
  // Create array of promises for concurrent execution
  const promises = users.slice(0, CONCURRENT_REQUESTS).map(user => 
    participateInGiveaway(user, GIVEAWAY_HASH)
  );
  
  // Wait for all requests to complete
  const results = await Promise.allSettled(promises);
  
  console.log('');
  console.log('📋 Results Summary:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  let failureCount = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successCount++;
      } else {
        failureCount++;
      }
    } else {
      failureCount++;
      console.log(`❌ ${users[index].userName}: Promise rejected - ${result.reason}`);
    }
  });
  
  console.log(`✅ Successful participations: ${successCount}`);
  console.log(`❌ Failed participations: ${failureCount}`);
  console.log('');
  
  // Expected behavior after fix:
  console.log('🔧 Expected Behavior After Fix:');
  console.log('- Each user should get their own unique portion');
  console.log('- No user should overwrite another user\'s participation');
  console.log('- Users should receive appropriate error messages for conflicts');
  console.log('- Only valid participants should be added to the giveaway');
}

// Run the test
if (require.main === module) {
  testConcurrentParticipation().catch(console.error);
}

module.exports = { testConcurrentParticipation, participateInGiveaway };
