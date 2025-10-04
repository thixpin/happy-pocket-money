#!/bin/bash

# Development Setup Script for Thadingyut Festival Pocket Money

set -e

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

echo "🎊 Setting up Thadingyut Festival Pocket Money for local development..."

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm 9+ first."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Install dependencies
print_step "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Set up environment files
print_step "Setting up environment files..."

# Backend environment
if [ ! -f "packages/backend/.env" ]; then
    if [ -f "packages/backend/.env.example" ]; then
        cp packages/backend/.env.example packages/backend/.env
        print_status "Created packages/backend/.env from example"
    else
        print_error "Backend .env.example file not found"
        exit 1
    fi
else
    print_status "Backend .env file already exists"
fi

# Frontend environment
if [ ! -f "packages/frontend/.env" ]; then
    if [ -f "packages/frontend/.env.example" ]; then
        cp packages/frontend/.env.example packages/frontend/.env
        print_status "Created packages/frontend/.env from example"
    else
        print_error "Frontend .env.example file not found"
        exit 1
    fi
else
    print_status "Frontend .env file already exists"
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
npm run lint || print_warning "Linting issues found (non-blocking)"

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
npm run test || print_warning "Some tests failed (check output above)"

# Display setup completion
echo ""
print_status "Development setup complete! 🎉"
echo ""
echo "📋 Next steps:"
echo "  1. Configure environment variables:"
echo "     - Edit packages/backend/.env"
echo "     - Edit packages/frontend/.env"
echo ""
echo "  2. Set up required services:"
echo "     - Facebook App (for OAuth)"
echo "     - AWS DynamoDB (for database)"
echo ""
echo "  3. Start development servers:"
echo "     npm run dev"
echo ""
echo "  4. Access the application:"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend API: http://localhost:3001"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - ENVIRONMENT_SETUP.md"
echo "   - LOCAL_TESTING_GUIDE.md"
echo ""
echo "🧪 To test the setup:"
echo "   ./test-local.sh"
echo ""
echo "🎊 Happy coding!"
