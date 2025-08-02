/**
 * Database Module
 *
 * This module handles all data operations for the ElitCards application.
 * Integrates with PocketBase for card data and uses localStorage for cart and user sessions.
 */

class Database {
    constructor() {
        // Configure PocketBase URL based on environment
        this.pocketbaseUrl = this.getPocketBaseUrl();
        this.pb = new PocketBase(this.pocketbaseUrl);
        this.isHttpsContext = window.location.protocol === 'https:';
        this.isProduction = this.isProductionEnvironment();
        
        console.log('🔧 Database Configuration:');
        console.log('Environment:', this.isProduction ? 'Production' : 'Development');
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        console.log('PocketBase URL:', this.pocketbaseUrl);
        
        this.initializeData();
        this.cachedProducts = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Determine the appropriate PocketBase URL based on environment
     * @returns {string} PocketBase URL
     */
    getPocketBaseUrl() {
        // Your NodeLumes PocketBase server
        const pocketbaseUrl = 'http://node68.lunes.host:3246';
        
        // Check if we're in a hosted environment that might have HTTPS
        const isHostedEnvironment = window.location.host !== 'localhost:8000' &&
                                   window.location.host !== '127.0.0.1:8000' &&
                                   !window.location.host.includes('localhost');
        
        if (isHostedEnvironment && this.isHttpsContext) {
            console.warn('⚠️ HTTPS frontend detected with HTTP PocketBase server.');
            console.warn('⚠️ This may cause mixed content issues in some browsers.');
            console.warn('💡 Consider using a proxy or upgrading PocketBase to HTTPS.');
        }
        
        return pocketbaseUrl;
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

        // Initialize exchange rate if not exists
        if (!localStorage.getItem('exchangeRate')) {
            localStorage.setItem('exchangeRate', JSON.stringify({
                usdToGhs: 12.5 // Example exchange rate
            }));
        }
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
            number: "XXXX XXXX XXXX " + Math.floor(Math.random() * 9000 + 1000), // Generate random last 4 digits
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
        if (price >= 300) return "Unlimited";
        if (price >= 250) return "$200,000";
        if (price >= 200) return "$100,000";
        if (price >= 150) return "$75,000";
        return "$50,000";
    }

    /**
     * Get all products from PocketBase with caching
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts() {
        try {
            // Check if we have valid cached data
            if (this.cachedProducts && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.cachedProducts;
            }

            // Skip PocketBase if in HTTPS context due to mixed content restrictions
            if (this.isHttpsContext) {
                console.warn('Skipping PocketBase connection due to HTTPS mixed content restrictions. Using fallback data.');
                return this.getFallbackProducts();
            }

            // Fetch from PocketBase
            const resultList = await this.pb.collection('Cards').getList(1, 50, {
                sort: '-created',
            });

            // Transform the data
            const transformedProducts = resultList.items.map(card => this.transformCardData(card));
            
            // Cache the results
            this.cachedProducts = transformedProducts;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            return transformedProducts;
        } catch (error) {
            console.error('Error fetching products from PocketBase:', error);
            
            // Fallback to dummy data if PocketBase fails
            return this.getFallbackProducts();
        }
    }

    /**
     * Get fallback products if PocketBase is unavailable
     * @returns {Array} Array of fallback product objects
     */
    getFallbackProducts() {
        const products = [
            // Set 1 - $35 pricing
            {id: 1, title: "Titanium Discover", price: 35, image: "images/titanium_discover.svg"},
            {id: 2, title: "Visa Infinite", price: 35, image: "images/visa_infinite.svg"},
            {id: 3, title: "Visa Infinite Black", price: 35, image: "images/visa_infinite_black.svg"},
            {id: 4, title: "Mastercard Platinum", price: 35, image: "images/mastercard_platinum.svg"},
            {id: 5, title: "Visa Gold", price: 35, image: "images/visa_gold.svg"},
            
            // Set 2 - $50 pricing
            {id: 6, title: "Titanium Discover", price: 50, image: "images/titanium_discover.svg"},
            {id: 7, title: "Visa Infinite", price: 50, image: "images/visa_infinite.svg"},
            {id: 8, title: "Visa Infinite Black", price: 50, image: "images/visa_infinite_black.svg"},
            {id: 9, title: "Mastercard Platinum", price: 50, image: "images/mastercard_platinum.svg"},
            {id: 10, title: "Visa Gold", price: 50, image: "images/visa_gold.svg"},
            
            // Set 3 - $70 pricing
            {id: 11, title: "Titanium Discover", price: 70, image: "images/titanium_discover.svg"},
            {id: 12, title: "Visa Infinite", price: 70, image: "images/visa_infinite.svg"},
            {id: 13, title: "Visa Infinite Black", price: 70, image: "images/visa_infinite_black.svg"},
            {id: 14, title: "Mastercard Platinum", price: 70, image: "images/mastercard_platinum.svg"},
            {id: 15, title: "Visa Gold", price: 70, image: "images/visa_gold.svg"},
            
            // Set 4 - $100 and $200 pricing
            {id: 16, title: "Titanium Discover", price: 100, image: "images/titanium_discover.svg"},
            {id: 17, title: "Visa Infinite", price: 100, image: "images/visa_infinite.svg"},
            {id: 18, title: "Visa Infinite Black", price: 100, image: "images/visa_infinite_black.svg"},
            {id: 19, title: "Mastercard Platinum", price: 200, image: "images/mastercard_platinum.svg"},
            {id: 20, title: "Visa Gold", price: 200, image: "images/visa_gold.svg"}
        ];

        // Transform to match expected format with additional fields
        return products.map(product => ({
            id: product.id.toString(), // Convert to string for consistency
            title: product.title,
            description: this.generateDescription(product.title, product.price),
            number: "XXXX XXXX XXXX " + Math.floor(Math.random() * 9000 + 1000),
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
            "Visa Infinite Black": "Exclusive Visa Infinite Black card with ultra-premium benefits and concierge services",
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
        if (price >= 200) return "Unlimited";
        if (price >= 100) return "$500,000";
        if (price >= 70) return "$200,000";
        if (price >= 50) return "$100,000";
        if (price >= 35) return "$50,000";
        return "$25,000";
    }

    /**
     * Get product by ID from PocketBase
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

            // Skip PocketBase if in HTTPS context
            if (this.isHttpsContext) {
                console.warn('Skipping PocketBase direct fetch due to HTTPS mixed content restrictions.');
                return null;
            }

            // If not in cache, fetch directly from PocketBase
            const pbCard = await this.pb.collection('Cards').getOne(id);
            return this.transformCardData(pbCard);
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
     * Add new user to PocketBase and localStorage
     * @param {Object} user - User object
     * @returns {Promise<Object>} Created user object
     */
    async addUser(user) {
        try {
            // Skip PocketBase if in HTTPS context
            if (!this.isHttpsContext) {
                // Try to create user in PocketBase first
                const pbUser = await this.pb.collection('users').create({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    passwordConfirm: user.password,
                    emailVisibility: true
                });
                
                // If successful, add PocketBase ID to user object
                user.pbId = pbUser.id;
                user.joinDate = pbUser.created;
            } else {
                // Fallback for HTTPS context
                user.joinDate = new Date().toISOString();
            }
        } catch (error) {
            console.warn('Failed to create user in PocketBase, using localStorage fallback:', error);
            user.joinDate = new Date().toISOString();
        }
        
        // Always store in localStorage as fallback
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        return user;
    }

    /**
     * Authenticate user with PocketBase
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object|null>} User object or null if authentication failed
     */
    async authenticateUser(email, password) {
        try {
            // Skip PocketBase if in HTTPS context
            if (!this.isHttpsContext) {
                // Try PocketBase authentication first
                const authData = await this.pb.collection('users').authWithPassword(email, password);
                
                if (authData.record) {
                    const user = {
                        pbId: authData.record.id,
                        name: authData.record.name,
                        email: authData.record.email,
                        joinDate: authData.record.created
                    };
                    
                    // Update localStorage with PocketBase user data
                    this.setCurrentUser(user);
                    return user;
                }
            }
        } catch (error) {
            console.warn('PocketBase authentication failed, trying localStorage fallback:', error);
        }
        
        // Fallback to localStorage authentication
        return this.findUser(email, password);
    }

    /**
     * Record payment submission to PocketBase
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

        let pbSuccess = false;
        let pbError = null;

        try {
            // Always try PocketBase first, regardless of HTTPS context
            console.log('🚀 Attempting to record payment in PocketBase...');
            console.log('🌐 Current protocol:', window.location.protocol);
            console.log('🔗 PocketBase URL:', this.pb.baseUrl);
            console.log('🏠 Frontend host:', window.location.host);
            console.log('🔒 HTTPS Context:', this.isHttpsContext);
            console.log('🌍 Production Environment:', this.isProduction);
            
            // Create FormData for file upload - mapping to PocketBase collection fields
            const formData = new FormData();
            formData.append('email', paymentRecord.userEmail);
            formData.append('name', paymentRecord.userEmail); // Use email as name for now
            formData.append('Card_type', ''); // Empty card type to avoid validation issues
            formData.append('note', JSON.stringify({
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                amountGHS: paymentRecord.amountGHS,
                cartItems: JSON.parse(paymentRecord.cartItems),
                status: paymentRecord.status,
                submittedAt: paymentRecord.submittedAt
            }));
            
            // Add screenshot file if provided - mapping to Screenshot field
            if (paymentData.screenshot) {
                console.log('Adding screenshot file:', paymentData.screenshot.name, paymentData.screenshot.size, 'bytes');
                formData.append('Screenshot', paymentData.screenshot);
            }

            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Try to create payment record in PocketBase
            const pbPayment = await this.pb.collection('payment_proofs').create(formData);
            paymentRecord.pbId = pbPayment.id;
            pbSuccess = true;
            
            console.log('✅ Payment successfully recorded in PocketBase:', pbPayment);
            
        } catch (error) {
            pbError = error;
            console.error('❌ Failed to record payment in PocketBase:', error);
            
            // Enhanced error handling for hosting scenarios
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🚫 Network Error - Possible causes:');
                console.error('   • CORS policy blocking cross-origin requests');
                console.error('   • Mixed content (HTTPS frontend → HTTP PocketBase)');
                console.error('   • PocketBase server not accessible from hosted environment');
                console.error('   • Network connectivity issues');
                
                if (this.isHttpsContext && this.pocketbaseUrl.startsWith('http:')) {
                    console.error('⚠️ MIXED CONTENT DETECTED:');
                    console.error('   Frontend (HTTPS) trying to connect to PocketBase (HTTP)');
                    console.error('   This is blocked by browser security policies');
                    console.error('💡 Solutions:');
                    console.error('   1. Upgrade PocketBase to HTTPS');
                    console.error('   2. Use a reverse proxy with SSL');
                    console.error('   3. Host frontend on HTTP (development only)');
                }
            }
            
            // Log detailed error information
            if (error.response) {
                console.error('PocketBase error response:', error.response);
            }
            if (error.data) {
                console.error('PocketBase error data:', error.data);
            }
            if (error.status) {
                console.error('HTTP Status:', error.status);
            }
        }
        
        // Always store in localStorage as fallback
        const payments = JSON.parse(localStorage.getItem('payments')) || [];
        payments.push(paymentRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        console.log('Payment record saved to localStorage:', paymentRecord);
        
        // Return success/failure information
        paymentRecord.pbSuccess = pbSuccess;
        paymentRecord.pbError = pbError?.message || null;
        
        return paymentRecord;
    }

    /**
     * Get user payments from PocketBase or localStorage
     * @param {string} userEmail - User email
     * @returns {Promise<Array>} Array of payment records
     */
    async getUserPayments(userEmail) {
        let payments = [];
        
        try {
            // Always try PocketBase first, regardless of HTTPS context
            // Try to fetch from PocketBase first using correct collection name
            const resultList = await this.pb.collection('payment_proofs').getList(1, 50, {
                filter: `email = "${userEmail}"`,
                sort: '-created',
            });
            
            payments = resultList.items.map(payment => {
                // Parse note field which contains our payment data
                let paymentData = {};
                try {
                    paymentData = JSON.parse(payment.note || '{}');
                } catch (e) {
                    console.warn('Failed to parse payment note:', payment.note);
                    paymentData = {};
                }
                
                return {
                    pbId: payment.id,
                    userEmail: payment.email,
                    amount: paymentData.amount || 0,
                    currency: paymentData.currency || 'USD',
                    amountGHS: paymentData.amountGHS || 0,
                    cartItems: paymentData.cartItems || [],
                    status: paymentData.status || 'pending',
                    submittedAt: paymentData.submittedAt || payment.created,
                    paymentScreenshot: payment.Screenshot ?
                        `http://node68.lunes.host:3246/api/files/payment_proofs/${payment.id}/${payment.Screenshot}` : null
                };
            });
        } catch (error) {
            console.warn('Failed to fetch payments from PocketBase, using localStorage fallback:', error);
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
            id: payment.pbId || `local_${Date.now()}_${Math.random()}`,
            date: new Date(payment.submittedAt).toLocaleDateString(),
            items: payment.cartItems,
            total: `$${payment.amount} (GHS ${payment.amountGHS})`,
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
    }

    /**
     * Test PocketBase connection and collection access
     * @returns {Promise<Object>} Connection test results
     */
    async testPocketBaseConnection() {
        const results = {
            connectionTest: false,
            collectionAccess: false,
            error: null,
            details: {}
        };

        try {
            console.log('🔍 Testing PocketBase connection...');
            console.log('PocketBase URL:', this.pb.baseUrl);
            
            // Test basic connection by trying to get health status
            try {
                const health = await this.pb.health.check();
                results.connectionTest = true;
                results.details.health = health;
                console.log('✅ PocketBase connection successful:', health);
            } catch (healthError) {
                console.log('❌ PocketBase health check failed:', healthError);
                results.details.healthError = healthError.message;
            }

            // Test collection access
            try {
                console.log('🔍 Testing payment_proofs collection access...');
                const collections = await this.pb.collections.getList(1, 10);
                results.details.collections = collections.items.map(c => ({ id: c.id, name: c.name, type: c.type }));
                
                const paymentProofsCollection = collections.items.find(c => c.name === 'payment_proofs');
                if (paymentProofsCollection) {
                    console.log('✅ payment_proofs collection found:', paymentProofsCollection);
                    results.collectionAccess = true;
                    results.details.paymentProofsCollection = paymentProofsCollection;
                } else {
                    console.log('❌ payment_proofs collection not found');
                    console.log('Available collections:', collections.items.map(c => c.name));
                    results.details.availableCollections = collections.items.map(c => c.name);
                }
            } catch (collectionError) {
                console.log('❌ Collection access failed:', collectionError);
                results.details.collectionError = collectionError.message;
            }

        } catch (error) {
            console.error('❌ PocketBase connection test failed:', error);
            results.error = error.message;
            results.details.generalError = error;
        }

        console.log('🔍 PocketBase test results:', results);
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
            amountGHS: 125.00,
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