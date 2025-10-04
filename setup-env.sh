#!/bin/bash

# Thadingyut Festival Pocket Money - Environment Setup Script

echo "🎊 Setting up Thadingyut Festival Pocket Money environment..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env created from example"
    echo "⚠️  Please edit backend/.env with your actual values"
else
    echo "✅ Backend .env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env created from example"
    echo "⚠️  Please edit frontend/.env with your actual values"
else
    echo "✅ Frontend .env already exists"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit backend/.env with your Facebook App ID, AWS credentials, etc."
echo "2. Edit frontend/.env with your Facebook App ID"
echo "3. Install dependencies: npm install (in both backend and frontend)"
echo "4. Start development servers: npm run dev"
echo ""
echo "📖 For detailed setup instructions, see ENVIRONMENT_SETUP.md"
echo ""
echo "🎉 Environment setup complete!"
