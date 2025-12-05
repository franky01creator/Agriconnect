# Google OAuth Setup Guide

This guide will help you set up Google Sign-In and Sign-Up for the Agriconnect application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "Agriconnect")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: Agriconnect
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Add scopes (if needed):
   - `email`
   - `profile`
6. Click "Save and Continue"
7. Add test users (optional for development)
8. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose application type: "Web application"
4. Name it (e.g., "Agriconnect Web Client")
5. Add authorized JavaScript origins:
   - For local development: `http://localhost:5001`
   - For production: Your production URL (e.g., `https://yourdomain.com`)
6. Add authorized redirect URIs:
   - For local development: `http://localhost:5001/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# For production, update to:
# GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Frontend URL (used for redirects)
FRONTEND_URL=http://localhost:5001
# For production:
# FRONTEND_URL=https://yourdomain.com

# Session Secret (can use your JWT_SECRET or generate a new one)
SESSION_SECRET=your-session-secret-here
```

## Step 6: Install Dependencies

Run the following command in the `backend` directory:

```bash
npm install passport passport-google-oauth20 express-session
```

## Step 7: Test the Integration

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Open your frontend in a browser (e.g., `http://localhost:5001`)

3. Navigate to the login or register page

4. Click the "Continue with Google" or "Sign up with Google" button

5. You should be redirected to Google's sign-in page

6. After signing in, you'll be redirected back to the application

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in your Google Cloud Console matches exactly with `GOOGLE_CALLBACK_URL` in your `.env` file
- Check that the protocol (http/https) and port match

### Error: "invalid_client"
- Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct in your `.env` file
- Make sure there are no extra spaces or quotes

### Error: "access_denied"
- Check that you've enabled the Google+ API in the Google Cloud Console
- Verify that the OAuth consent screen is properly configured

### Users can't sign in with Google
- Check server logs for errors
- Verify that the database connection is working
- Ensure the User model has been updated with `googleId` and `profilePicture` fields

## Security Notes

1. **Never commit your `.env` file** to version control
2. Keep your `GOOGLE_CLIENT_SECRET` secure
3. Use HTTPS in production
4. Regularly rotate your OAuth credentials
5. Monitor OAuth usage in Google Cloud Console

## Production Deployment

When deploying to production:

1. Update `GOOGLE_CALLBACK_URL` to your production URL
2. Update `FRONTEND_URL` to your production URL
3. Add your production domain to authorized JavaScript origins in Google Cloud Console
4. Add your production callback URL to authorized redirect URIs
5. Update the OAuth consent screen with your production domain
6. Submit your app for verification if you plan to make it public (required for production)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)

