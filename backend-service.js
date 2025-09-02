/**
 * Backend Service Module
 * 
 * This module handles all API calls to the new backend service,
 * replacing the previous PocketBase implementation.
 */

class BackendService {
    constructor() {
        // Get backend URL from config
        this.backendUrl = window.EliteCardsConfig?.backend?.url || 'http://localhost:3000/api';
        
        // Log initialization
        console.log('🔧 Backend Service initialized with URL:', this.backendUrl);
    }

    /**
     * Generic API request method
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {Object} data - Request data (for POST/PUT)
     * @param {Object} headers - Additional headers
     * @returns {Promise} API response
     */
    async apiRequest(endpoint, method = 'GET', data = null, headers = {}) {
        const url = `${this.backendUrl}${endpoint}`;
        
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            console.log(`🚀 API Request: ${method} ${url}`, data);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ API Response: ${method} ${url}`, result);
            return result;
        } catch (error) {
            console.error(`❌ API Request Failed: ${method} ${url}`, error);
            throw error;
        }
    }

    /**
     * Get all cards
     * @returns {Promise<Array>} Array of card objects
     */
    async getCards() {
        try {
            const response = await this.apiRequest('/cards');
            return response.data || response;
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            throw error;
        }
    }

    /**
     * Get card by ID
     * @param {string} id - Card ID
     * @returns {Promise<Object>} Card object
     */
    async getCardById(id) {
        try {
            const response = await this.apiRequest(`/cards/${id}`);
            return response.data || response;
        } catch (error) {
            console.error(`Failed to fetch card ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new card
     * @param {Object} cardData - Card data
     * @returns {Promise<Object>} Created card object
     */
    async createCard(cardData) {
        try {
            const response = await this.apiRequest('/cards', 'POST', cardData);
            return response.data || response;
        } catch (error) {
            console.error('Failed to create card:', error);
            throw error;
        }
    }

    /**
     * Update a card
     * @param {string} id - Card ID
     * @param {Object} cardData - Updated card data
     * @returns {Promise<Object>} Updated card object
     */
    async updateCard(id, cardData) {
        try {
            const response = await this.apiRequest(`/cards/${id}`, 'PUT', cardData);
            return response.data || response;
        } catch (error) {
            console.error(`Failed to update card ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a card
     * @param {string} id - Card ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteCard(id) {
        try {
            const response = await this.apiRequest(`/cards/${id}`, 'DELETE');
            return response.data || response;
        } catch (error) {
            console.error(`Failed to delete card ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get all users
     * @returns {Promise<Array>} Array of user objects
     */
    async getUsers() {
        try {
            const response = await this.apiRequest('/users');
            return response.data || response;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<Object>} User object
     */
    async getUserByEmail(email) {
        try {
            const response = await this.apiRequest(`/users?email=${encodeURIComponent(email)}`);
            const users = response.data || response;
            return Array.isArray(users) ? users[0] : users;
        } catch (error) {
            console.error(`Failed to fetch user ${email}:`, error);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user object
     */
    async createUser(userData) {
        try {
            const response = await this.apiRequest('/users', 'POST', userData);
            return response.data || response;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Authenticate user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication result
     */
    async authenticateUser(email, password) {
        try {
            const response = await this.apiRequest('/auth/login', 'POST', { email, password });
            return response.data || response;
        } catch (error) {
            console.error('Failed to authenticate user:', error);
            throw error;
        }
    }

    /**
     * Get all payments
     * @returns {Promise<Array>} Array of payment objects
     */
    async getPayments() {
        try {
            const response = await this.apiRequest('/payments');
            return response.data || response;
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            throw error;
        }
    }

    /**
     * Get payments by user email
     * @param {string} email - User email
     * @returns {Promise<Array>} Array of payment objects
     */
    async getPaymentsByEmail(email) {
        try {
            const response = await this.apiRequest(`/payments?email=${encodeURIComponent(email)}`);
            return response.data || response;
        } catch (error) {
            console.error(`Failed to fetch payments for ${email}:`, error);
            throw error;
        }
    }

    /**
     * Create a new payment
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} Created payment object
     */
    async createPayment(paymentData) {
        try {
            const response = await this.apiRequest('/payments', 'POST', paymentData);
            return response.data || response;
        } catch (error) {
            console.error('Failed to create payment:', error);
            throw error;
        }
    }

    /**
     * Update payment status
     * @param {string} id - Payment ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated payment object
     */
    async updatePaymentStatus(id, status) {
        try {
            const response = await this.apiRequest(`/payments/${id}`, 'PUT', { status });
            return response.data || response;
        } catch (error) {
            console.error(`Failed to update payment ${id} status:`, error);
            throw error;
        }
    }
}

// Create a global instance
const backendService = new BackendService();

// Export for use in other modules
window.BackendService = BackendService;
window.backendService = backendService;