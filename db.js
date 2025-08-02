/**
 * Database Module
 *
 * This module handles all data operations for the ElitCards application.
 * Integrates with PocketBase for card data and uses localStorage for cart and user sessions.
 */

class Database {
    constructor() {
        // Initialize PocketBase - use HTTP since the server doesn't support HTTPS
        // This will only work when the site is served over HTTP
        this.pb = new PocketBase('http://node68.lunes.host:3246');
        this.isHttpsContext = window.location.protocol === 'https:';
        this.initializeData();
        this.cachedProducts = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
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
            {id: 1, title: "Mastercard Platinum", price: 35, image: "images/mastercard_platinum.jpg"},
            {id: 2, title: "Visa Gold", price: 35, image: "images/visa_gold.jpg"},
            {id: 3, title: "American Express", price: 35, image: "images/american_express.jpg"},
            {id: 4, title: "Visa Infinite", price: 35, image: "images/visa_infinite.jpg"},
            {id: 5, title: "Titanium Discover", price: 35, image: "images/titanium_discover.jpg"},
            
            // Set 2 - $50 pricing
            {id: 6, title: "Mastercard Platinum", price: 50, image: "images/mastercard_platinum.jpg"},
            {id: 7, title: "Visa Gold", price: 50, image: "images/visa_gold.jpg"},
            {id: 8, title: "American Express", price: 50, image: "images/american_express.jpg"},
            {id: 9, title: "Visa Infinite", price: 50, image: "images/visa_infinite.jpg"},
            {id: 10, title: "Titanium Discover", price: 50, image: "images/titanium_discover.jpg"},
            
            // Set 3 - $70 pricing
            {id: 11, title: "Mastercard Platinum", price: 70, image: "images/mastercard_platinum.jpg"},
            {id: 12, title: "Visa Gold", price: 70, image: "images/visa_gold.jpg"},
            {id: 13, title: "American Express", price: 70, image: "images/american_express.jpg"},
            {id: 14, title: "Visa Infinite", price: 70, image: "images/visa_infinite.jpg"},
            {id: 15, title: "Titanium Discover", price: 70, image: "images/titanium_discover.jpg"},
            
            // Set 4 - $100 and $200 pricing
            {id: 16, title: "Mastercard Platinum", price: 100, image: "images/mastercard_platinum.jpg"},
            {id: 17, title: "Visa Gold", price: 100, image: "images/visa_gold.jpg"},
            {id: 18, title: "American Express", price: 100, image: "images/american_express.jpg"},
            {id: 19, title: "Visa Infinite", price: 200, image: "images/visa_infinite.jpg"},
            {id: 20, title: "Titanium Discover", price: 200, image: "images/titanium_discover.jpg"}
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
     * Add new user
     * @param {Object} user - User object
     */
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
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
}

// Create a single instance of the Database class
const db = new Database();

// Export the database instance
// This makes it available to other scripts that include this file