/**
 * Database Module
 * 
 * This module handles all data operations for the ElitCards application.
 * Currently uses localStorage for persistence, but designed to be easily
 * replaceable with real databases like PocketBase or SQL in the future.
 */

class Database {
    constructor() {
        this.initializeData();
    }

    /**
     * Initialize data if not already present in localStorage
     */
    initializeData() {
        // Initialize products if not exists
if (!localStorage.getItem('products')) {
    const defaultProducts = [
        {
            id: 1,
            title: "Mastercard Platinum",
            number: "XXXX XXXX XXXX 1111",
            limit: "$75,000",
            price: 35,
            image: "images/mastercard_platinum.jpg"
        },
        {
            id: 2,
            title: "Visa Infinite",
            number: "XXXX XXXX XXXX 2222",
            limit: "$100,000",
            price: 50,
            image: "images/visa_infinite.jpg"
        },
        {
            id: 3,
            title: "Amex Gold",
            number: "XXXX XXXX XXXX 3333",
            limit: "$60,000",
            price: 40,
            image: "images/amex_gold.jpg"
        },
        {
            id: 4,
            title: "Amex Platinum",
            number: "XXXX XXXX XXXX 4444",
            limit: "$120,000",
            price: 60,
            image: "images/amex_platinum.jpg"
        },
        {
            id: 5,
            title: "Chase Sapphire Reserve",
            number: "XXXX XXXX XXXX 5555",
            limit: "$90,000",
            price: 55,
            image: "images/chase_sapphire_reserve.jpg"
        },
        {
            id: 6,
            title: "Citi Prestige",
            number: "XXXX XXXX XXXX 6666",
            limit: "$85,000",
            price: 45,
            image: "images/citi_prestige.jpg"
        },
        {
            id: 7,
            title: "HSBC Premier",
            number: "XXXX XXXX XXXX 7777",
            limit: "$70,000",
            price: 38,
            image: "images/hsbc_premier.jpg"
        },
        {
            id: 8,
            title: "Barclays Black",
            number: "XXXX XXXX XXXX 8888",
            limit: "$95,000",
            price: 42,
            image: "images/barclays_black.jpg"
        },
        {
            id: 9,
            title: "Capital One Venture X",
            number: "XXXX XXXX XXXX 9999",
            limit: "$80,000",
            price: 37,
            image: "images/capitalone_venturex.jpg"
        },
        {
            id: 10,
            title: "Discover IT Chrome",
            number: "XXXX XXXX XXXX 1010",
            limit: "$60,000",
            price: 28,
            image: "images/discover_it_chrome.jpg"
        },
        {
            id: 11,
            title: "Revolut Metal",
            number: "XXXX XXXX XXXX 1112",
            limit: "$55,000",
            price: 30,
            image: "images/revolut_metal.jpg"
        },
        {
            id: 12,
            title: "N26 Black",
            number: "XXXX XXXX XXXX 1213",
            limit: "$50,000",
            price: 32,
            image: "images/n26_black.jpg"
        },
        {
            id: 13,
            title: "Curve Metal",
            number: "XXXX XXXX XXXX 1314",
            limit: "$48,000",
            price: 29,
            image: "images/curve_metal.jpg"
        },
        {
            id: 14,
            title: "Monzo Premium",
            number: "XXXX XXXX XXXX 1415",
            limit: "$52,000",
            price: 31,
            image: "images/monzo_premium.jpg"
        },
        {
            id: 15,
            title: "Wirex Crypto",
            number: "XXXX XXXX XXXX 1516",
            limit: "$40,000",
            price: 27,
            image: "images/wirex_crypto.jpg"
        },
        {
            id: 16,
            title: "Crypto.com Ruby",
            number: "XXXX XXXX XXXX 1617",
            limit: "$45,000",
            price: 33,
            image: "images/crypto_ruby.jpg"
        },
        {
            id: 17,
            title: "Crypto.com Obsidian",
            number: "XXXX XXXX XXXX 1718",
            limit: "$150,000",
            price: 65,
            image: "images/crypto_obsidian.jpg"
        },
        {
            id: 18,
            title: "Payoneer Business",
            number: "XXXX XXXX XXXX 1819",
            limit: "$70,000",
            price: 36,
            image: "images/payoneer_business.jpg"
        },
        {
            id: 19,
            title: "Wise Borderless",
            number: "XXXX XXXX XXXX 1920",
            limit: "$55,000",
            price: 34,
            image: "images/wise_borderless.jpg"
        },
        {
            id: 20,
            title: "US Bank Altitude Reserve",
            number: "XXXX XXXX XXXX 2021",
            limit: "$110,000",
            price: 52,
            image: "images/usbank_altitude_reserve.jpg"
        }
    ];

    localStorage.setItem('products', JSON.stringify(defaultProducts));
}

        // Initialize cart if not exists
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }

        // Initialize users if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password123",
                   
                },
                {
                    name: "Jane Smith",
                    email: "jane@example.com",
                    password: "password123",
                   
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
     * Get all products
     * @returns {Array} Array of product objects
     */
    getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Object|null} Product object or null if not found
     */
    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === id) || null;
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
     * @returns {number} Cart subtotal
     */
    getCartSubtotal() {
        const cart = this.getCart();
        const products = this.getProducts();
        
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