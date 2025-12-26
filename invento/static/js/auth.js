// ============================================
// INVENTO - Authentication Module
// Handles user authentication and authorization
// ============================================

class AuthManager {
    constructor() {
        this.user = null;
        this.loadUser();
    }

    // Load user from localStorage
    loadUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
    }

    // Save user to localStorage
    saveUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Login user
    async login(email, password) {
        try {
            const response = await apiClient.post('/accounts/login/', {
                email,
                password,
            }, { auth: false });

            // Store tokens
            apiClient.setTokens(response.access, response.refresh);

            // Store user info
            this.saveUser(response.user);

            return { success: true, user: response.user };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed. Please check your credentials.',
            };
        }
    }

    // Logout user
    async logout() {
        try {
            // Call logout endpoint (optional)
            await apiClient.post('/accounts/logout/', {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            apiClient.clearTokens();
            this.user = null;
            // Redirect to login
            window.location.href = '/';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!apiClient.getAccessToken() && !!this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get user role
    getUserRole() {
        return this.user?.role || 'viewer';
    }

    // Check if user has specific role
    hasRole(role) {
        return this.getUserRole() === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Check if user is viewer
    isViewer() {
        return this.hasRole('viewer');
    }

    // Fetch user profile from server
    async fetchProfile() {
        try {
            const response = await apiClient.get('/accounts/profile/');
            this.saveUser(response);
            return response;
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }

    // Require authentication - redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    // Require admin role - redirect if not admin
    requireAdmin() {
        if (!this.requireAuth()) return false;

        if (!this.isAdmin()) {
            showToast('Access Denied', 'You need admin privileges to access this page.', 'error');
            window.location.href = '/dashboard/';
            return false;
        }
        return true;
    }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in other modules
window.authManager = authManager;
