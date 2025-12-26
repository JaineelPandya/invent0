// ============================================
// INVENTO - API Client Module
// Handles all API requests with JWT authentication
// ============================================

const API_BASE_URL = '/api';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get JWT access token from localStorage
    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    // Get JWT refresh token from localStorage
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    // Set tokens in localStorage
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    // Clear tokens from localStorage
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    // Build headers with JWT token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAccessToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false),
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized - token expired
            if (response.status === 401 && this.getRefreshToken()) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry the original request with new token
                    config.headers = this.getHeaders(options.auth !== false);
                    const retryResponse = await fetch(url, config);
                    return this.handleResponse(retryResponse);
                } else {
                    // Refresh failed, redirect to login
                    this.clearTokens();
                    window.location.href = '/';
                    throw new Error('Session expired. Please login again.');
                }
            }

            return this.handleResponse(response);
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Handle API response
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.detail || data.message || 'An error occurred',
                    errors: data,
                };
            }

            return data;
        } else {
            // Handle non-JSON responses (like file downloads)
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'An error occurred',
                };
            }
            return response;
        }
    }

    // Refresh access token using refresh token
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.baseURL}/accounts/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access, null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    }

    // HTTP Methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }

    // Download file (for CSV/XLSX exports)
    async downloadFile(endpoint, filename) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAccessToken();

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) {
                // Try to refresh token if 401
                if (response.status === 401 && this.getRefreshToken()) {
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        // Retry with new token
                        return this.downloadFile(endpoint, filename);
                    }
                }
                throw new Error(`Download failed: ${response.status}`);
            }

            const blob = await response.blob();

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('File download error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Export for use in other modules
window.apiClient = apiClient;
