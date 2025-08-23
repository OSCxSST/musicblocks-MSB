/**
 * Authentication Manager for Music Blocks
 * Handles Google OAuth integration
 */
class AuthManager {
    constructor() {
        this.googleAuth = new GoogleAuth();
        this.currentUser = null;
        this.authCallbacks = [];
    }

    async init() {
        try {
            await this.googleAuth.init();
            this.setupEventListeners();
            console.log('Auth Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Auth Manager:', error);
            this.showAuthError('Failed to initialize authentication');
        }
    }

    setupEventListeners() {
        // Google Sign In button
        const signInBtn = document.getElementById('google-signin-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', this.handleSignIn.bind(this));
        }

        // Google Sign Out button
        const signOutBtn = document.getElementById('google-signout-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', this.handleSignOut.bind(this));
        }
    }

    async handleSignIn() {
        try {
            const user = await this.googleAuth.signIn();
            this.currentUser = user;
            this.notifyAuthCallbacks('signin', user);
            this.hideAuthError();
        } catch (error) {
            console.error('Sign in error:', error);
            this.showAuthError('Failed to sign in with Google. Please try again.');
        }
    }

    async handleSignOut() {
        try {
            await this.googleAuth.signOut();
            this.currentUser = null;
            this.notifyAuthCallbacks('signout');
            this.hideAuthError();
        } catch (error) {
            console.error('Sign out error:', error);
            this.showAuthError('Failed to sign out. Please try again.');
        }
    }

    onAuthStateChange(callback) {
        this.authCallbacks.push(callback);
    }

    notifyAuthCallbacks(event, user = null) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(event, user);
            } catch (error) {
                console.error('Auth callback error:', error);
            }
        });
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideAuthError() {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isSignedIn() {
        return this.googleAuth.isUserSignedIn();
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (window.authManager) return; // Already initialized
    
    window.authManager = new AuthManager();
    await window.authManager.init();
});

window.AuthManager = AuthManager;
