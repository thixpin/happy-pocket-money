# Thadingyut Festival Pocket Money Platform

A festive web application for sharing pocket money during Myanmar's Thadingyut Festival. Users can create giveaways with specified budgets that get randomly distributed among participants through secure URLs.

## 🏗️ **Monorepo Structure**

This project uses a monorepo structure with the following packages:

- **`@thadingyut/frontend`**: React frontend application
- **`@thadingyut/backend`**: Node.js backend API  
- **`@thadingyut/shared`**: Shared types and utilities

## Features

- 🎊 **Facebook Authentication**: Secure login with Facebook OAuth
- 💰 **Giveaway Creation**: Create giveaways with budget and receiver count
- 🔒 **Secure URLs**: Cryptographically secure hash-based URLs
- 🎲 **Fair Distribution**: Random but fair money distribution algorithm
- 📱 **Mobile-First Design**: Optimized for mobile devices
- 🎨 **Festival Theming**: Traditional Myanmar festival colors and design
- 💬 **Social Integration**: Facebook Messenger integration for communication
- 📊 **Dashboard**: Track giveaway progress and participants

## Tech Stack

### Frontend (`@thadingyut/frontend`)
- React.js with TypeScript
- Styled Components for styling
- React Router for navigation
- Facebook SDK for authentication
- React Share for social sharing

### Backend (`@thadingyut/backend`)
- Node.js with TypeScript
- Express.js for API server
- AWS DynamoDB for database
- JWT for authentication
- AWS Lambda for serverless deployment

### Shared (`@thadingyut/shared`)
- TypeScript types and interfaces
- Common utilities and validation
- Shared between frontend and backend

### Infrastructure
- AWS S3 + CloudFront for frontend hosting
- AWS API Gateway + Lambda for backend
- AWS DynamoDB for data storage
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS Account (for production)
- Facebook Developer Account

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pocket-money
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies for all packages
   npm install
   ```

3. **Environment Configuration**
   
   Copy the example environment files and configure them:
   
   ```bash
   # Backend
   cd packages/backend
   cp .env.example .env
   # Edit .env with your actual values
   
   # Frontend  
   cd ../frontend
   cp .env.example .env
   # Edit .env with your actual values
   ```
   
   **Required Services:**
   - Facebook App (for OAuth)
   - AWS Account (for DynamoDB)
   - DynamoDB Local (for development)
   
   See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

4. **Start development servers**
   ```bash
   # Start all packages in development mode
   npm run dev
   
   # Or start specific packages
   npm run dev:frontend
   npm run dev:backend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🧪 **Local Testing**

### **Quick Testing**
```bash
# Run the automated test script
./test-local.sh

# Test API endpoints
./test-api.sh
```

### **Manual Testing**
1. **Authentication**: Test Facebook login flow
2. **Giveaway Creation**: Create test giveaways
3. **Participation**: Test the participation flow
4. **Dashboard**: Verify giver dashboard functionality

### **Testing Commands**
```bash
# Run all tests
npm run test

# Test specific packages
npm run test:frontend
npm run test:backend

# Run with coverage
npm run test:coverage

# Linting
npm run lint
```

For detailed testing instructions, see [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md).

## Project Structure

```
pocket-money/
├── packages/
│   ├── frontend/            # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts (Auth)
│   │   │   ├── services/    # API services
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── App.tsx      # Main app component
│   │   └── package.json
│   ├── backend/             # Node.js backend API
│   │   ├── src/
│   │   │   ├── controllers/ # API controllers
│   │   │   ├── middleware/ # Express middleware
│   │   │   ├── services/   # Business logic services
│   │   │   ├── utils/      # Utility functions
│   │   │   ├── types/      # TypeScript type definitions
│   │   │   └── lambda/     # AWS Lambda handlers
│   │   └── package.json
│   └── shared/              # Shared types and utilities
│       ├── src/
│       │   └── index.ts     # Shared types and interfaces
│       └── package.json
├── deploy/                  # Deployment scripts and infrastructure
├── .github/workflows/       # CI/CD workflows
├── package.json            # Root package.json with workspaces
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/facebook` - Facebook login
- `GET /auth/verify` - Verify JWT token
- `POST /auth/refresh` - Refresh JWT token

### Giveaways
- `POST /giveaways` - Create new giveaway
- `GET /giveaways/{hash}` - Get giveaway by hash
- `POST /giveaways/{hash}/participate` - Participate in giveaway
- `GET /giveaways/{hash}/dashboard` - Get giveaway dashboard

## User Flow

1. **Authentication**: Users login with Facebook
2. **Create Giveaway**: Givers create giveaways with budget and receiver count
3. **Share URL**: Secure URL is generated and shared
4. **Participate**: Receivers access URL and participate
5. **Random Distribution**: Fair random portions are calculated
6. **Results**: Participants see their portions and can share results
7. **Dashboard**: Givers track participants and contact them via Messenger

## Security Features

- JWT-based authentication with refresh tokens
- Cryptographically secure URL hashes
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- XSS protection

## Deployment

### AWS Infrastructure
- S3 + CloudFront for frontend hosting
- API Gateway + Lambda for backend
- DynamoDB for data storage
- IAM roles for security

### CI/CD Pipeline
- GitHub Actions for automated testing
- Automated deployment to AWS
- Environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact [your-email@example.com] or create an issue in the repository.
