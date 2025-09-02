/**
 * Database Module
 *
 * This module handles all data operations for the ElitCards application.
 * Integrates with PocketBase for card data and uses localStorage for cart and user sessions.
 */

class Database {
    constructor() {
        // Initialize backend service
        this.backend = new BackendService();
        this.isHttpsContext = window.location.protocol === 'https:';
        this.isProduction = this.isProductionEnvironment();
        
        console.log('🔧 Database Configuration:');
        console.log('Environment:', this.isProduction ? 'Production' : 'Development');
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        console.log('Backend URL:', this.backend.backendUrl);
        
        this.initializeData();
        this.cachedProducts = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get backend URL from config
     * @returns {string} Backend URL
     */
    getBackendUrl() {
        return window.EliteCardsConfig?.backend?.url || 'http://localhost:3000/api';
    }

    /**
     * Check if we're in a production environment
     * @returns {boolean} True if production environment
     */
    isProductionEnvironment() {
        const host = window.location.host.toLowerCase();
        return !host.includes('localhost') &&
               !host.includes('127.0.0.1') &&
               !host.includes('codespace') &&
               host !== '';
    }

    /**
     * Initialize data if not already present in localStorage
     */
    initializeData() {
        // Initialize cart if not exists or force reset if invalid
        const existingCart = localStorage.getItem('cart');
        if (!existingCart) {
            localStorage.setItem('cart', JSON.stringify([]));
        } else {
            try {
                const parsedCart = JSON.parse(existingCart);
                if (!Array.isArray(parsedCart)) {
                    // If cart is not an array, reset it
                    localStorage.setItem('cart', JSON.stringify([]));
                }
            } catch (error) {
                // If cart data is corrupted, reset it
                console.warn('Cart data corrupted, resetting:', error);
                localStorage.setItem('cart', JSON.stringify([]));
            }
        }

        // Initialize users if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password123",
                    joinDate: "2023-01-15T12:00:00.000Z"
                },
                {
                    name: "Jane Smith",
                    email: "jane@example.com",
                    password: "password123",
                    joinDate: "2023-02-20T14:30:00.000Z"
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize or update exchange rate to ensure it's set to 10.38
        localStorage.setItem('exchangeRate', JSON.stringify({
            usdToGhs: 10.38 // Fixed exchange rate: $1 = GHC 10.38
        }));
    }

    /**
     * Transform PocketBase card data to match frontend expectations
     * @param {Object} pbCard - PocketBase card object
     * @returns {Object} Transformed card object
     */
    transformCardData(pbCard) {
        return {
            id: pbCard.id,
            title: pbCard.Name,
            description: pbCard.Description,
            number: "XXXX XXXX XXXX XXXX", // Only show asterisks, no digits
            limit: this.extractLimitFromDescription(pbCard.Description),
            price: pbCard.Price,
            image: pbCard.Image ? `http://node68.lunes.host:3246/api/files/Cards/${pbCard.id}/${pbCard.Image}` : "images/default-card.png"
        };
    }

    /**
     * Extract limit information from description
     * @param {string} description - Card description
     * @returns {string} Extracted limit or default
     */
    extractLimitFromDescription(description) {
        // Try to extract limit from description, fallback to default patterns
        const limitPatterns = [
            /\$[\d,]+/g,
            /unlimited/i,
            /no limit/i
        ];
        
        for (const pattern of limitPatterns) {
            const match = description.match(pattern);
            if (match) {
                return match[0];
            }
        }
        
        // Default limits based on price ranges
        const price = parseFloat(description) || 0;
        if (price >= 300) return "$3,500";
        if (price >= 250) return "$3,000";
        if (price >= 200) return "$2,500";
        if (price >= 150) return "$2,000";
        return "$1,000";
    }

    /**
     * Get all products from backend with caching
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts() {
        try {
            // Check if we have valid cached data
            if (this.cachedProducts && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.cachedProducts;
            }

            // Fetch from backend
            const products = await this.backend.getCards();

            // Transform the data
            const transformedProducts = products.map(card => this.transformCardData(card));
            
            // Cache the results
            this.cachedProducts = transformedProducts;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            return transformedProducts;
        } catch (error) {
            console.error('Error fetching products from backend:', error);
            
            // Fallback to dummy data if backend fails
            return this.getFallbackProducts();
        }
    }

    /**
     * Get fallback products if PocketBase is unavailable
     * @returns {Array} Array of fallback product objects
     */
    getFallbackProducts() {
        const products = [
            // Mixed pricing pattern using only $35, $70, $100, $200
            {id: 1, title: "Titanium Discover", price: 50, image: "images/titanium-discover.png"},
            {id: 2, title: "Visa Infinite", price: 35, image: "images/visa-infinite.png"},
            {id: 3, title: "American Express", price: 100, image: "images/american-express.png"},
            {id: 4, title: "Mastercard Platinum", price: 70, image: "images/mastercard-platinum.png"},
            {id: 5, title: "Visa Gold", price: 200, image: "images/visa-gold.png"},
            
            {id: 6, title: "Titanium Discover", price: 35, image: "images/titanium-discover.png"},
            {id: 7, title: "Visa Infinite", price: 50, image: "images/visa-infinite.png"},
            {id: 8, title: "American Express", price: 70, image: "images/american-express.png"},
            {id: 9, title: "Mastercard Platinum", price: 200, image: "images/mastercard-platinum.png"},
            {id: 10, title: "Visa Gold", price: 100, image: "images/visa-gold.png"},
            
            {id: 11, title: "Titanium Discover", price: 100, image: "images/titanium-discover.png"},
            {id: 12, title: "Visa Infinite", price: 70, image: "images/visa-infinite.png"},
            {id: 13, title: "American Express", price: 200, image: "images/american-express.png"},
            {id: 14, title: "Mastercard Platinum", price: 35, image: "images/mastercard-platinum.png"},
            {id: 15, title: "Visa Gold", price: 50, image: "images/visa-gold.png"},
            
            {id: 16, title: "Titanium Discover", price: 70, image: "images/titanium-discover.png"},
            {id: 17, title: "Visa Infinite", price: 50, image: "images/visa-infinite.png"},
            {id: 18, title: "American Express", price: 35, image: "images/american-express.png"},
            {id: 19, title: "Mastercard Platinum", price: 100, image: "images/mastercard-platinum.png"},
            {id: 20, title: "Visa Gold", price: 200, image: "images/visa-gold.png"}
        ];

        // Transform to match expected format with additional fields
        return products.map(product => ({
            id: product.id.toString(), // Convert to string for consistency
            title: product.title,
            description: this.generateDescription(product.title, product.price),
            number: "XXXX XXXX XXXX XXXX",
            limit: this.generateLimit(product.price),
            price: product.price,
            image: product.image
        }));
    }

    /**
     * Generate description based on card title and price
     * @param {string} title - Card title
     * @param {number} price - Card price
     * @returns {string} Generated description
     */
    generateDescription(title, price) {
        const descriptions = {
            "Mastercard Platinum": "Premium Mastercard Platinum with exclusive benefits and worldwide acceptance",
            "Visa Gold": "Elite Visa Gold card with premium rewards and luxury perks",
            "American Express": "Prestigious American Express card with unmatched prestige and benefits",
            "Visa Infinite": "Ultimate Visa Infinite card with unlimited possibilities and premium services",
            "American Express": "Exclusive American Express card with ultra-premium benefits and concierge services",
            "Titanium Discover": "Exclusive Titanium Discover card with cashback rewards and premium features"
        };
        
        return descriptions[title] || `Premium ${title} card with exclusive benefits`;
    }

    /**
     * Generate spending limit based on price
     * @param {number} price - Card price
     * @returns {string} Generated limit
     */
    generateLimit(price) {
        if (price >= 200) return "$3,500";
        if (price >= 100) return "$3,000";
        if (price >= 70) return "$2,500";
        if (price >= 50) return "$2,000";
        if (price >= 35) return "$1,500";
        return "$1,000";
    }

    /**
     * Get product by ID from backend
     * @param {string} id - Product ID
     * @returns {Promise<Object|null>} Product object or null if not found
     */
    async getProductById(id) {
        try {
            // First try to get from cache
            const products = await this.getProducts();
            const cachedProduct = products.find(product => product.id === id);
            if (cachedProduct) {
                return cachedProduct;
            }

            // If not in cache, fetch directly from backend
            const card = await this.backend.getCardById(id);
            return this.transformCardData(card);
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            return null;
        }
    }

    /**
     * Get cart items
     * @returns {Array} Array of cart item objects
     */
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    /**
     * Get number of items in cart
     * @returns {number} Total number of items
     */
    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Calculate cart subtotal
     * @returns {Promise<number>} Cart subtotal
     */
    async getCartSubtotal() {
        const cart = this.getCart();
        const products = await this.getProducts();
        
        return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.id);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    /**
     * Add item to cart
     * @param {number} productId - Product ID to add
     */
    addToCart(productId) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Remove item from cart
     * @param {number} productId - Product ID to remove
     */
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Clear all items from cart
     */
    clearCart() {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    /**
     * Force reset cart - completely remove and reinitialize
     */
    forceResetCart() {
        localStorage.removeItem('cart');
        localStorage.setItem('cart', JSON.stringify([]));
    }

    /**
     * Debug cart contents
     */
    debugCart() {
        const cart = this.getCart();
        const count = this.getCartCount();
        console.log('=== DB CART DEBUG ===');
        console.log('Cart contents:', cart);
        console.log('Cart count:', count);
        console.log('Raw localStorage:', localStorage.getItem('cart'));
        console.log('====================');
        return { cart, count, raw: localStorage.getItem('cart') };
    }

    /**
     * Complete reset of all localStorage data
     */
    resetAllData() {
        localStorage.clear();
        this.initializeData();
        console.log('All localStorage data reset and reinitialized');
    }

    /**
     * Convert USD to GHS
     * @param {number} amount - Amount in USD
     * @returns {string} Formatted amount in GHS
     */
    usdToGhs(amount) {
        const exchangeRate = JSON.parse(localStorage.getItem('exchangeRate')).usdToGhs;
        return (amount * exchangeRate).toFixed(2);
    }

    /**
     * Format price with currency symbol
     * @param {number} amount - Amount to format
     * @returns {string} Formatted price
     */
    formatPrice(amount) {
        return `$${amount.toFixed(2)}`;
    }

    /**
     * Get all users
     * @returns {Array} Array of user objects
     */
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    /**
     * Get current logged in user
     * @returns {Object|null} Current user object or null if not logged in
     */
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    /**
     * Set current user
     * @param {Object|null} user - User object or null to logout
     */
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    /**
     * Find user by email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object|null} User object or null if not found
     */
    findUser(email, password) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.password === password) || null;
    }

    /**
     * Check if user exists
     * @param {string} email - User email
     * @returns {boolean} True if user exists, false otherwise
     */
    userExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email === email);
    }

    /**
     * Add new user to backend and localStorage
     * @param {Object} user - User object
     * @returns {Promise<Object>} Created user object
     */
    async addUser(user) {
        try {
            // Try to create user in backend first
            const backendUser = await this.backend.createUser({
                name: user.name,
                email: user.email,
                password: user.password
            });
            
            // If successful, add backend ID to user object
            user.backendId = backendUser.id;
            user.joinDate = backendUser.created || new Date().toISOString();
        } catch (error) {
            console.warn('Failed to create user in backend, using localStorage fallback:', error);
            user.joinDate = new Date().toISOString();
        }
        
        // Always store in localStorage as fallback
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        return user;
    }

    /**
     * Authenticate user with backend
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object|null>} User object or null if authentication failed
     */
    async authenticateUser(email, password) {
        try {
            // Try backend authentication first
            const authData = await this.backend.authenticateUser(email, password);
            
            if (authData) {
                const user = {
                    backendId: authData.id,
                    name: authData.name,
                    email: authData.email,
                    joinDate: authData.created || authData.joinDate
                };
                
                // Update localStorage with backend user data
                this.setCurrentUser(user);
                return user;
            }
        } catch (error) {
            console.warn('Backend authentication failed, trying localStorage fallback:', error);
        }
        
        // Fallback to localStorage authentication
        return this.findUser(email, password);
    }

    /**
     * Record payment submission to backend
     * @param {Object} paymentData - Payment data object
     * @returns {Promise<Object>} Created payment record
     */
    async recordPayment(paymentData) {
        const paymentRecord = {
            userEmail: paymentData.email,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            amountGHS: paymentData.amountGHS,
            cartItems: JSON.stringify(paymentData.cartItems),
            paymentScreenshot: paymentData.screenshot,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        let backendSuccess = false;
        let backendError = null;

        try {
            // Prepare payment data for backend
            const backendPaymentData = {
                email: paymentRecord.userEmail,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                amountGHS: paymentRecord.amountGHS,
                cartItems: JSON.parse(paymentRecord.cartItems),
                status: paymentRecord.status,
                submittedAt: paymentRecord.submittedAt
            };

            // Add screenshot file if provided
            if (paymentData.screenshot) {
                backendPaymentData.screenshot = paymentData.screenshot;
            }

            // Try to create payment record in backend
            const backendPayment = await this.backend.createPayment(backendPaymentData);
            paymentRecord.backendId = backendPayment.id;
            backendSuccess = true;
            
            console.log('✅ Payment successfully recorded in backend:', backendPayment);
            
        } catch (error) {
            backendError = error;
            console.error('❌ Failed to record payment in backend:', error);
        }
        
        // Always store in localStorage as fallback
        const payments = JSON.parse(localStorage.getItem('payments')) || [];
        payments.push(paymentRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        console.log('Payment record saved to localStorage:', paymentRecord);
        
        // Return success/failure information
        paymentRecord.backendSuccess = backendSuccess;
        paymentRecord.backendError = backendError?.message || null;
        
        return paymentRecord;
    }

    /**
     * Get user payments from backend or localStorage
     * @param {string} userEmail - User email
     * @returns {Promise<Array>} Array of payment records
     */
    async getUserPayments(userEmail) {
        let payments = [];
        
        try {
            // Try to fetch from backend first
            const backendPayments = await this.backend.getPaymentsByEmail(userEmail);
            
            payments = backendPayments.map(payment => {
                return {
                    backendId: payment.id,
                    userEmail: payment.email,
                    amount: payment.amount || 0,
                    currency: payment.currency || 'USD',
                    amountGHS: payment.amountGHS || 0,
                    cartItems: payment.cartItems || [],
                    status: payment.status || 'pending',
                    submittedAt: payment.submittedAt || payment.created,
                    paymentScreenshot: payment.screenshot || null
                };
            });
        } catch (error) {
            console.warn('Failed to fetch payments from backend, using localStorage fallback:', error);
        }
        
        // Fallback to localStorage
        if (payments.length === 0) {
            const localPayments = JSON.parse(localStorage.getItem('payments')) || [];
            payments = localPayments.filter(payment => payment.userEmail === userEmail);
        }
        
        return payments;
    }

    /**
     * Get recent orders for display in user dashboard
     * @param {string} userEmail - User email
     * @returns {Promise<Array>} Array of recent order records
     */
    async getRecentOrders(userEmail) {
        const payments = await this.getUserPayments(userEmail);
        
        // Transform payments into order format for display
        return payments.map(payment => ({
            id: payment.backendId || `local_${Date.now()}_${Math.random()}`,
            date: new Date(payment.submittedAt).toLocaleDateString(),
            items: payment.cartItems,
            total: `$${payment.amount}`,
            status: payment.status,
            paymentScreenshot: payment.paymentScreenshot
        })).slice(0, 5); // Show only last 5 orders
    }

    /**
     * Update exchange rate
     * @param {number} rate - New USD to GHS exchange rate
     */
    updateExchangeRate(rate) {
        localStorage.setItem('exchangeRate', JSON.stringify({
            usdToGhs: rate
        }));
        console.log(`Exchange rate updated to $1 = GHC ${rate}`);
    }

    /**
     * Get current exchange rate
     * @returns {number} Current USD to GHS exchange rate
     */
    getCurrentExchangeRate() {
        const exchangeRate = JSON.parse(localStorage.getItem('exchangeRate'));
        return exchangeRate ? exchangeRate.usdToGhs : 10.38;
    }

    /**
     * Force update exchange rate to 10.38 (for debugging/admin use)
     */
    fixExchangeRate() {
        this.updateExchangeRate(10.38);
        return this.getCurrentExchangeRate();
    }

    /**
     * Test backend connection and API access
     * @returns {Promise<Object>} Connection test results
     */
    async testBackendConnection() {
        const results = {
            connectionTest: false,
            apiAccess: false,
            error: null,
            details: {}
        };

        try {
            console.log('🔍 Testing backend connection...');
            console.log('Backend URL:', this.backend.backendUrl);
            
            // Test basic connection by trying to get health status
            try {
                // Assuming the backend service has a health check method
                // If not, we can test by getting cards
                const cards = await this.backend.getCards();
                results.connectionTest = true;
                results.details.cardCount = cards.length;
                console.log('✅ Backend connection successful, found', cards.length, 'cards');
            } catch (healthError) {
                console.log('❌ Backend health check failed:', healthError);
                results.details.healthError = healthError.message;
            }

            // Test API access
            try {
                console.log('🔍 Testing backend API access...');
                // Test users API
                const users = await this.backend.getUsers();
                results.apiAccess = true;
                results.details.userCount = users.length;
                console.log('✅ Backend API access successful, found', users.length, 'users');
            } catch (apiError) {
                console.log('❌ Backend API access failed:', apiError);
                results.details.apiError = apiError.message;
            }

        } catch (error) {
            console.error('❌ Backend connection test failed:', error);
            results.error = error.message;
            results.details.generalError = error;
        }

        console.log('🔍 Backend test results:', results);
        return results;
    }

    /**
     * Create a test payment record to verify functionality
     * @returns {Promise<Object>} Test result
     */
    async testPaymentSubmission() {
        console.log('🧪 Testing payment submission...');
        
        // Create a test file blob
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const response = await fetch(testImageData);
        const blob = await response.blob();
        const testFile = new File([blob], 'test-screenshot.png', { type: 'image/png' });

        const testPaymentData = {
            email: 'test@example.com',
            amount: 10.00,
            currency: 'USD',
            amountGHS: 103.80,
            cartItems: [
                {
                    id: 'test-1',
                    title: 'Test Card',
                    price: 9.00,
                    quantity: 1,
                    total: 9.00
                }
            ],
            screenshot: testFile
        };

        try {
            const result = await this.recordPayment(testPaymentData);
            console.log('🧪 Test payment submission result:', result);
            return result;
        } catch (error) {
            console.error('🧪 Test payment submission failed:', error);
            throw error;
        }
    }
}

// Create a single instance of the Database class
const db = new Database();

// Export the database instance
// This makes it available to other scripts that include this file