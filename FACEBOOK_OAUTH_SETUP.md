# Facebook OAuth Setup with Static Redirect URI

## Overview
This implementation uses a static redirect URI for Facebook OAuth to comply with Facebook's requirements while maintaining a seamless user experience.

## How It Works

1. **Static Redirect URI**: All Facebook OAuth flows redirect to `/auth/callback`
2. **localStorage Redirect**: The intended destination is stored in localStorage before redirecting to Facebook
3. **Post-Login Redirect**: After successful authentication, users are redirected to their intended destination

## Facebook App Configuration

### Valid OAuth Redirect URIs
Add these URLs to your Facebook app's OAuth settings:

```
https://pocket.thixpin.me/auth/callback
```

### Required Environment Variables

#### Backend (AWS SAM Parameters)
When deploying with AWS SAM, provide these parameters:

```bash
sam deploy --parameter-overrides \
  FacebookAppId=your_facebook_app_id \
  FacebookAppSecret=your_facebook_app_secret
```

#### Frontend (.env)
```env
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_API_URL=https://pocket-api.thixpin.me
```

## Current Issue
The backend is missing Facebook environment variables, causing the error:
```
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error","details":"Facebook configuration is incomplete"}}
```

## Implementation Details

### Frontend Flow
1. User clicks "Continue with Facebook"
2. Current URL is stored in `localStorage.intendedRedirectUrl`
3. User is redirected to Facebook OAuth with static redirect URI
4. After Facebook authentication, user is redirected to `/auth/callback`
5. AuthCallback component exchanges code for tokens
6. User is redirected to their intended destination

### Backend Flow
1. `/auth/facebook/callback` endpoint receives authorization code
2. Code is exchanged for Facebook access token
3. User info is retrieved and user is created/logged in
4. JWT tokens are generated and returned
5. Frontend handles the redirect to intended destination

## Benefits

- ✅ **Facebook Compliant**: Uses static redirect URI as required
- ✅ **Seamless UX**: Users return to their intended destination
- ✅ **Secure**: No sensitive data in URLs
- ✅ **Flexible**: Works with any page in the application

## Testing

1. Navigate to any giveaway page
2. Click "Continue with Facebook"
3. Complete Facebook authentication
4. Verify you're redirected back to the original page
