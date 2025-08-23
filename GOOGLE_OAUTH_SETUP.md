# Google OAuth Setup Instructions for Music Blocks

## Prerequisites
1. You need a Google Cloud Platform account
2. You need to create a project in Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Choose "External" for user type (unless you're using a Google Workspace account)
   - Fill in required fields:
     - App name: "Music Blocks"
     - User support email: your email
     - Developer contact information: your email
6. Create the OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Music Blocks Web Client"

## Step 2: Configure Authorized Domains

### For Development (localhost):
Add these to "Authorized JavaScript origins":
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8080` (if using different port)

Add these to "Authorized redirect URIs":
- `http://localhost:3000/`
- `http://127.0.0.1:3000/`

### For Production:
Add your actual domain to "Authorized JavaScript origins":
- `https://yourdomain.com`
- `https://www.yourdomain.com` (if applicable)

Add your actual domain to "Authorized redirect URIs":
- `https://yourdomain.com/`
- `https://www.yourdomain.com/` (if applicable)

## Step 3: Configure the Application

1. Copy your OAuth 2.0 Client ID
2. Open `js/auth/GoogleAuth.js`
3. Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID:

```javascript
// Replace this line in GoogleAuth.js:
this.CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
```

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run serve
   ```

2. Open http://localhost:3000 in your browser

3. You should see a "Sign In" button in the top-right corner

4. Click the button to test Google OAuth login

## Common Issues and Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Make sure your redirect URIs in Google Cloud Console exactly match your application's URL, including the port number.

### Issue: "Error 400: invalid_request"
**Solution**: Check that your Client ID is correctly configured in the GoogleAuth.js file.

### Issue: "This app isn't verified"
**Solution**: This is normal during development. Click "Advanced" and then "Go to Music Blocks (unsafe)" to continue. For production, you'll need to verify your app with Google.

### Issue: Sign in button doesn't appear
**Solution**: 
1. Check browser console for JavaScript errors
2. Verify that the auth scripts are loading properly
3. Make sure your Client ID is set correctly

## Testing with Different Domains

If you're testing on a different port or domain, update both:
1. Google Cloud Console authorized origins/redirects
2. Your application's base URL configuration

## Security Notes

1. Never commit your actual Client ID to public repositories
2. Use environment variables for production deployments
3. Consider implementing server-side validation of Google tokens for enhanced security
4. Regularly rotate your OAuth credentials

## Optional: Environment Variables Setup

For production, create a `.env` file (don't commit this):

```
GOOGLE_OAUTH_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
```

Then modify GoogleAuth.js to use:
```javascript
this.CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || 'YOUR_CLIENT_ID';
```

## Support

If you encounter issues:
1. Check the browser's developer console for errors
2. Verify your Google Cloud Console settings
3. Ensure your domain is properly configured
4. Check that all required scripts are loading
