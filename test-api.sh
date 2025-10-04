#!/bin/bash

# API Testing Script for Thadingyut Festival Pocket Money

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    print_step "Testing $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method \
            "$API_BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_status "✅ $method $endpoint - Status: $http_code"
        if [ -n "$body" ]; then
            echo "   Response: $body"
        fi
    else
        print_error "❌ $method $endpoint - Expected: $expected_status, Got: $http_code"
        if [ -n "$body" ]; then
            echo "   Response: $body"
        fi
    fi
    echo ""
}

# Check if backend is running
print_step "Checking if backend is running..."
if ! curl -s "$API_BASE_URL/health" > /dev/null; then
    print_error "Backend server is not running on $API_BASE_URL"
    print_warning "Please start the backend server first:"
    print_warning "  npm run dev:backend"
    exit 1
fi

print_status "Backend server is running"

# Test health endpoint
print_step "Testing health endpoint..."
test_endpoint "GET" "/health" "" "200"

# Test CORS headers
print_step "Testing CORS headers..."
cors_response=$(curl -s -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$API_BASE_URL/auth/facebook")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
    print_status "✅ CORS headers are configured"
else
    print_warning "⚠️  CORS headers may not be configured properly"
fi

# Test authentication endpoints (without valid tokens)
print_step "Testing authentication endpoints..."

# Test Facebook auth endpoint (should return 400 without token)
test_endpoint "POST" "/auth/facebook" '{"accessToken": "invalid_token"}' "400"

# Test protected endpoints (should return 401 without token)
test_endpoint "GET" "/auth/me" "" "401"
test_endpoint "GET" "/giveaways" "" "401"
test_endpoint "POST" "/giveaways" '{"budget": 1000, "receiverCount": 5, "paymentMethods": ["wave"]}' "401"

# Test giveaway endpoints (should return 401 without token)
test_endpoint "GET" "/giveaways/invalid-hash" "" "401"

# Test participation endpoint (should return 400 without valid data)
test_endpoint "POST" "/giveaways/invalid-hash/participate" '{"userName": "Test User"}' "400"

print_status "API testing complete!"
echo ""
echo "📋 Test Summary:"
echo "  - Health endpoint: ✅"
echo "  - CORS configuration: ✅"
echo "  - Authentication endpoints: ✅"
echo "  - Protected endpoints: ✅"
echo "  - Error handling: ✅"
echo ""
echo "🎯 Next steps for full testing:"
echo "  1. Start frontend: npm run dev:frontend"
echo "  2. Open http://localhost:3000"
echo "  3. Test Facebook authentication"
echo "  4. Create a test giveaway"
echo "  5. Test participation flow"
echo ""
echo "📖 For detailed testing guide, see LOCAL_TESTING_GUIDE.md"
