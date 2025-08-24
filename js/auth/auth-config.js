/**
 * Configuration file for Music Blocks Google OAuth
 * 
 * IMPORTANT: Replace the CLIENT_ID with your actual Google OAuth Client ID
 * Follow the instructions in GOOGLE_OAUTH_SETUP.md to get your Client ID
 */

const AUTH_CONFIG = {
    // Replace this with your actual Google OAuth Client ID
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com',
    
    // OAuth scopes - what permissions we request from Google
    SCOPES: 'profile email',
    
    // Whether to show detailed error messages (set to false in production)
    DEBUG_MODE: true,
    
    // Whether authentication is required to use the app
    REQUIRE_AUTH: false,
    
    // Default user preferences for authenticated users
    DEFAULT_PREFERENCES: {
        saveToCloud: true,
        shareProjects: true,
        emailNotifications: false
    }
};

// Make config available globally
window.AUTH_CONFIG = AUTH_CONFIG;
