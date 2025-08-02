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
        return [
            {
                id: "fallback-1",
                title: "Elite Visa Black Card",
                description: "Premium black card with unlimited spending power",
                number: "XXXX XXXX XXXX 1234",
                limit: "Unlimited",
                price: 299.99,
                image: "images/card1.png"
            },
            {
                id: "fallback-2",
                title: "Elite Mastercard Gold",
                description: "Gold card with $50,000 spending limit",
                number: "XXXX XXXX XXXX 5678",
                limit: "$50,000",
                price: 199.99,
                image: "images/card2.png"
            },
            {
                id: "fallback-3",
                title: "Elite Amex Platinum",
                description: "Platinum card with $100,000 spending limit",
                number: "XXXX XXXX XXXX 9012",
                limit: "$100,000",
                price: 249.99,
                image: "images/card3.png"
            }
        ];
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