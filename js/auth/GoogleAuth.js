/**
 * Google OAuth Authentication for Music Blocks
 */
class GoogleAuth {
    constructor() {
        this.gapi = null;
        this.auth2 = null;
        this.isSignedIn = false;
        this.user = null;
        
        // Get configuration from auth-config.js
        this.CLIENT_ID = window.AUTH_CONFIG?.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';
        this.SCOPE = window.AUTH_CONFIG?.SCOPES || 'profile email';
        this.DEBUG_MODE = window.AUTH_CONFIG?.DEBUG_MODE || false;
    }

    async init() {
        try {
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize the gapi client
            await this.gapi.load('auth2', async () => {
                this.auth2 = await this.gapi.auth2.init({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPE
                });
                
                // Check if user is already signed in
                this.isSignedIn = this.auth2.isSignedIn.get();
                if (this.isSignedIn) {
                    this.user = this.auth2.currentUser.get();
                    this.updateUIAfterSignIn();
                }
                
                // Set up sign-in state listeners
                this.auth2.isSignedIn.listen(this.updateSigninStatus.bind(this));
            });
            
            console.log('Google Auth initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
        }
    }

    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                this.gapi = window.gapi;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                this.gapi = window.gapi;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Google API'));
            document.head.appendChild(script);
        });
    }

    async signIn() {
        try {
            const authInstance = this.auth2;
            const user = await authInstance.signIn();
            this.user = user;
            this.isSignedIn = true;
            this.updateUIAfterSignIn();
            console.log('User signed in successfully');
            return user;
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth2.signOut();
            this.user = null;
            this.isSignedIn = false;
            this.updateUIAfterSignOut();
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    }

    updateSigninStatus(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            this.user = this.auth2.currentUser.get();
            this.updateUIAfterSignIn();
        } else {
            this.user = null;
            this.updateUIAfterSignOut();
        }
    }

    updateUIAfterSignIn() {
        if (this.user) {
            const profile = this.user.getBasicProfile();
            const userInfo = {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl()
            };
            
            // Update UI elements
            this.showUserInfo(userInfo);
            this.hideSignInButton();
            this.showSignOutButton();
        }
    }

    updateUIAfterSignOut() {
        this.hideUserInfo();
        this.showSignInButton();
        this.hideSignOutButton();
    }

    showUserInfo(userInfo) {
        // Update user display elements
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.innerHTML = `
                <img src="${userInfo.imageUrl}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%;">
                <span>${userInfo.name}</span>
            `;
            userDisplay.style.display = 'flex';
        }
    }

    hideUserInfo() {
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.style.display = 'none';
        }
    }

    showSignInButton() {
        const signInBtn = document.getElementById('google-signin-btn');
        if (signInBtn) {
            signInBtn.style.display = 'block';
        }
    }

    hideSignInButton() {
        const signInBtn = document.getElementById('google-signin-btn');
        if (signInBtn) {
            signInBtn.style.display = 'none';
        }
    }

    showSignOutButton() {
        const signOutBtn = document.getElementById('google-signout-btn');
        if (signOutBtn) {
            signOutBtn.style.display = 'block';
        }
    }

    hideSignOutButton() {
        const signOutBtn = document.getElementById('google-signout-btn');
        if (signOutBtn) {
            signOutBtn.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.user;
    }

    isUserSignedIn() {
        return this.isSignedIn;
    }
}

// Export for use in other modules
window.GoogleAuth = GoogleAuth;
