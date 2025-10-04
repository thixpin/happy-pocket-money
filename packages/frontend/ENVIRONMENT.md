# Environment Variables

This project has been migrated from Create React App to Vite. Environment variables now use the `VITE_` prefix instead of `REACT_APP_`.

## Required Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# API Base URL - Backend API endpoint
VITE_API_URL=http://localhost:3001

# Facebook App ID - Required for Facebook OAuth authentication
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

## Example .env.local File

```bash
# Frontend Environment Variables (Vite)
VITE_API_URL=http://localhost:3001
VITE_FACEBOOK_APP_ID=1234567890123456
```

## Migration Changes

The following environment variables were renamed:
- `REACT_APP_API_URL` → `VITE_API_URL`
- `REACT_APP_FACEBOOK_APP_ID` → `VITE_FACEBOOK_APP_ID`

## Usage in Code

Environment variables are now accessed using `import.meta.env` instead of `process.env`:

```typescript
// Old (Create React App)
const apiUrl = process.env.REACT_APP_API_URL;

// New (Vite)
const apiUrl = import.meta.env.VITE_API_URL;
```

## Environment Variable Setup

1. Copy the example above to `packages/frontend/.env.local`
2. Replace `your_facebook_app_id_here` with your actual Facebook App ID
3. Update `VITE_API_URL` if your backend runs on a different port
4. Restart your development server after making changes

## Production Deployment

For production, set these environment variables in your deployment platform:
- `VITE_API_URL` - Your production API URL
- `VITE_FACEBOOK_APP_ID` - Your Facebook App ID
