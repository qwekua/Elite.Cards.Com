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
                    title: "Elite Visa Black Card",
                    number: "XXXX XXXX XXXX 1234",
                    limit: "Unlimited",
                    price: 299.99,
                    image: "images/card1.png"
                },
                {
                    id: 2,
                    title: "Elite Mastercard Gold",
                    number: "XXXX XXXX XXXX 5678",
                    limit: "$50,000",
                    price: 199.99,
                    image: "images/card2.png"
                },
                {
                    id: 3,
                    title: "Elite Amex Platinum",
                    number: "XXXX XXXX XXXX 9012",
                    limit: "$100,000",
                    price: 249.99,
                    image: "images/card3.png"
                },
                {
                    id: 4,
                    title: "Elite Discover Diamond",
                    number: "XXXX XXXX XXXX 3456",
                    limit: "$75,000",
                    price: 179.99,
                    image: "images/card4.png"
                },
                {
                    id: 5,
                    title: "Elite Visa Infinite",
                    number: "XXXX XXXX XXXX 7890",
                    limit: "$200,000",
                    price: 349.99,
                    image: "images/card5.png"
                },
                {
                    id: 6,
                    title: "Elite Mastercard World",
                    number: "XXXX XXXX XXXX 2345",
                    limit: "$150,000",
                    price: 279.99,
                    image: "images/card6.png"
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