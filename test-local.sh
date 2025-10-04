#!/bin/bash

# Thadingyut Festival Pocket Money - Local Testing Script

set -e

echo "🎊 Starting local testing for Thadingyut Festival Pocket Money..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm 9+ first."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Check if environment files exist
print_step "Checking environment configuration..."

if [ ! -f "packages/backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "packages/backend/.env.example" ]; then
        cp packages/backend/.env.example packages/backend/.env
        print_warning "Please edit packages/backend/.env with your actual values"
    else
        print_error "Backend .env.example file not found"
        exit 1
    fi
fi

if [ ! -f "packages/frontend/.env" ]; then
    print_warning "Frontend .env file not found. Creating from example..."
    if [ -f "packages/frontend/.env.example" ]; then
        cp packages/frontend/.env.example packages/frontend/.env
        print_warning "Please edit packages/frontend/.env with your actual values"
    else
        print_error "Frontend .env.example file not found"
        exit 1
    fi
fi

print_status "Environment files found"

# Install dependencies
print_step "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build shared package
print_step "Building shared package..."
npm run build --workspace=packages/shared

if [ $? -eq 0 ]; then
    print_status "Shared package built successfully"
else
    print_error "Failed to build shared package"
    exit 1
fi

# Run linting
print_step "Running linting..."
npm run lint

if [ $? -eq 0 ]; then
    print_status "Linting passed"
else
    print_warning "Linting issues found (non-blocking)"
fi

# Run type checking
print_step "Running type checking..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Run tests
print_step "Running tests..."
npm run test

if [ $? -eq 0 ]; then
    print_status "All tests passed"
else
    print_warning "Some tests failed (check output above)"
fi

# Check if services can start
print_step "Testing service startup..."

# Start backend in background
print_status "Starting backend server..."
cd packages/backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    print_status "Backend server is running on port 3001"
else
    print_warning "Backend server may not be running properly"
fi

# Start frontend in background
print_status "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Frontend server is running on port 3000"
else
    print_warning "Frontend server may not be running properly"
fi

# Display results
echo ""
print_status "Local testing setup complete!"
echo ""
echo "🌐 Services running:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - Health Check: http://localhost:3001/health"
echo ""
echo "📋 Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Test the Facebook login flow"
echo "  3. Create a test giveaway"
echo "  4. Test participation flow"
echo ""
echo "🛑 To stop services:"
echo "  - Press Ctrl+C to stop this script"
echo "  - Or kill processes: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📖 For detailed testing guide, see LOCAL_TESTING_GUIDE.md"
echo ""
echo "🎉 Happy testing!"

# Keep script running
wait
