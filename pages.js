/**
 * Pages System
 * 
 * This script handles loading and managing pages for the ElitCards application.
 * It provides a smooth transition between different pages by dynamically loading HTML content.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Page container element
    const pageContainer = document.getElementById('component-container');
    
    // Check if page container exists
    if (!pageContainer) {
        console.error('Page container not found. Element with ID "component-container" is missing.');
        return;
    }
    
    // Add fade transition to page container
    pageContainer.style.transition = 'opacity 0.3s ease';
    
    // Page content - embedded directly to avoid CORS issues with local files
    const PAGES = {
        HOME: `
            <!-- Hero Section -->
            <section class="hero" id="home-section">
                <div class="hero-content">
                    <h1>Premium Virtual Cards for Your Financial Freedom</h1>
                    <p>Access exclusive virtual cards with high limits and premium benefits tailored for global professionals.</p>
                    <div class="hero-badges">
                        <span class="badge">Secure</span>
                        <span class="badge">Instant</span>
                        <span class="badge">Premium</span>
                    </div>
                    <button class="cta-btn" id="browse-cards-btn">Browse Cards</button>
                </div>
            </section>
            
            <!-- Features Section -->
            <section class="features">
                <div class="container">
                    <h2 class="section-title">Why Choose <span class="highlight">ElitCards</span></h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure Transactions</h3>
                            <p>All card details are encrypted and securely stored with bank-level security measures.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <h3>Instant Delivery</h3>
                            <p>Receive your card details immediately after payment confirmation via Mobile Money.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-headset"></i>
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Our dedicated support team is available round the clock to assist with any issues.</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        PRODUCTS: `
            <!-- Products Section -->
            <section class="products" id="products-section">
                <div class="container">
                    <h2 class="section-title">Premium <span class="highlight">Virtual Cards</span></h2>
                    <p class="section-description">Choose from our selection of high-quality virtual cards with premium benefits.</p>
                    <div class="products-grid" id="products-grid">
                        <!-- Products will be loaded dynamically -->
                    </div>
                </div>
            </section>
        `,
       DASHBOARD: `
    <section class="dashboard">
        <div class="container">
            <h2 class="section-title">Admin Dashboard</h2>
            <!-- Dashboard content here -->
        </div>
    </section>

    <!-- 👇 About section inside dashboard -->
    <section class="about" id="about-section">
        <div class="container">
            <h2 class="section-title">About <span class="highlight">ElitCards</span></h2>
            <p>ElitCards provides high-limit virtual cards with instant delivery, secure payments, and unmatched convenience. We aim to simplify online financial transactions for professionals worldwide.</p>
            <div class="about-features">
                <div class="feature">
                    <i class="fas fa-shield-alt"></i>
                    <h3>Security First</h3>
                    <p>End-to-end encrypted systems built with your safety in mind.</p>
                </div>
                <div class="feature">
                    <i class="fas fa-clock"></i>
                    <h3>Instant Issuance</h3>
                    <p>Virtual cards delivered immediately after payment confirmation.</p>
                </div>
            </div>
        </div>
    </section>
`

        CART: `
            <!-- Cart Section -->
            <section class="cart" id="cart-section">
                <div class="container">
                    <h2 class="section-title">Your <span class="highlight">Cart</span></h2>
                    <div class="cart-container">
                        <div class="cart-items" id="cart-items">
                            <!-- Cart items will be loaded dynamically -->
                        </div>
                        <div class="cart-summary" id="cart-summary">
                            <h3>Order Summary</h3>
                            <div class="summary-item">
                                <span>Subtotal</span>
                                <span id="cart-subtotal">$0.00</span>
                            </div>
                            <div class="summary-item">
                                <span>Service Fee</span>
                                <span>$1.00</span>
                            </div>
                            <div class="summary-item total">
                                <span>Total</span>
                                <span id="cart-total">$0.00</span>
                            </div>
                            <button class="checkout-btn" id="checkout-btn">Proceed to Checkout</button>
                        </div>
                    </div>
                </div>
            </section>
        `,
        MODALS: `
            <!-- Auth Modal -->
            <div class="modal-overlay" id="auth-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Account Access</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="auth-tabs">
                            <div class="auth-tab active" data-tab="login">Login</div>
                            <div class="auth-tab" data-tab="register">Register</div>
                        </div>
                        <div class="auth-forms">
                            <form class="auth-form active" id="login-form">
                                <div class="form-group">
                                    <label for="login-email">Email</label>
                                    <input type="email" id="login-email" required>
                                </div>
                                <div class="form-group">
                                    <label for="login-password">Password</label>
                                    <input type="password" id="login-password" required>
                                </div>
                                <button type="submit" class="auth-btn">Login</button>
                                <p class="auth-switch">Don't have an account? <a href="#" class="switch-auth">Register</a></p>
                            </form>
                            <form class="auth-form" id="register-form">
                                <div class="form-group">
                                    <label for="register-name">Full Name</label>
                                    <input type="text" id="register-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-email">Email</label>
                                    <input type="email" id="register-email" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-password">Password</label>
                                    <input type="password" id="register-password" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-confirm">Confirm Password</label>
                                    <input type="password" id="register-confirm" required>
                                </div>
                                <button type="submit" class="auth-btn">Register</button>
                                <p class="auth-switch">Already have an account? <a href="#" class="switch-auth">Login</a></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Payment Modal -->
            <div class="modal-overlay" id="payment-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Complete Your Payment</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="payment-details">
                            <p>Total Amount: <span id="payment-amount">$0.00</span></p>
                            <p>Please send the exact amount to the following Mobile Money number:</p>
                            <div class="payment-number">
                                <span>+233 55 123 4567</span>
                                <button class="copy-btn" id="copy-number">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="payment-instructions">
                                <p>After sending the payment, please upload a screenshot of the payment confirmation:</p>
                            </div>
                            <div class="form-group">
                                <label for="payment-email">Email (for receipt)</label>
                                <input type="email" id="payment-email" required>
                            </div>
                            <div class="upload-section" id="upload-section">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Click to upload payment screenshot</p>
                                <input type="file" id="payment-screenshot" accept="image/*" style="display: none;">
                                <img id="preview-image" src="#" alt="Preview" style="display: none; max-width: 100%; margin-top: 10px;">
                            </div>
                            <button class="confirm-btn" id="confirm-payment-btn" disabled>Confirm Payment</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Success Modal -->
            <div class="modal-overlay" id="success-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Payment Successful!</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="success-message">
                            <i class="fas fa-check-circle"></i>
                            <p>Your payment has been received and is being processed.</p>
                            <p>Your card details will be sent to your email within 24 hours.</p>
                            <button class="close-btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        // 👇 ADD THIS
    ABOUT: `
        <!-- About Section -->
        <section class="about" id="about-section">
            <div class="container">
                <h2 class="section-title">About <span class="highlight">ElitCards</span></h2>
                <p>ElitCards provides high-limit virtual cards with instant delivery, secure payments, and unmatched convenience. We aim to simplify online financial transactions for professionals worldwide.</p>
                <div class="about-features">
                    <div class="feature">
                        <i class="fas fa-shield-alt"></i>
                        <h3>Security First</h3>
                        <p>End-to-end encrypted systems built with your safety in mind.</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-clock"></i>
                        <h3>Instant Issuance</h3>
                        <p>Virtual cards delivered immediately after payment confirmation.</p>
                    </div>
                </div>
            </div>
        </section>
    `

    };
    
    /**
     * Load a page into the container
     * @param {string} pageKey - Key of the page to load (HOME, PRODUCTS, etc.)
     * @param {boolean} append - Whether to append the page or replace existing content
     * @returns {Promise} - Promise that resolves when the page is loaded
     */
    async function loadPage(pageKey, append = false) {
        try {
            // If not appending, fade out current content
            if (!append) {
                pageContainer.style.opacity = '0';
                
                // Wait for fade out animation
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Clear container
                pageContainer.innerHTML = '';
            }
            
            // Get page content from embedded content
            const pageContent = PAGES[pageKey];
            
            // Create a temporary container for the page
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = pageContent;
            
            // Append all child nodes to the page container
            while (tempContainer.firstChild) {
                pageContainer.appendChild(tempContainer.firstChild);
            }
            
            // Fade in the new content
            pageContainer.style.opacity = '1';
            
            // Return the loaded page
            return pageContainer;
        } catch (error) {
            console.error('Error loading page:', error);
            pageContainer.innerHTML = `<div class="error-message">Failed to load page: ${error.message}</div>`;
            return null;
        }
    }
    
    /**
     * Initialize the pages system
     */
    async function initPages() {
        try {
            // Add modals directly to the body
            const modalsContainer = document.createElement('div');
            modalsContainer.id = 'modals-container';
            modalsContainer.innerHTML = PAGES.MODALS;
            document.body.appendChild(modalsContainer);
            
            // Load home page by default
            await loadPage('HOME');
            
            console.log('Pages initialized successfully');
        } catch (error) {
            console.error('Error initializing pages:', error);
        }
    }
    
    // Initialize pages
    initPages();
    
    // Export functions for use in other scripts
    window.Pages = {
        load: function(pageKey) {
            return loadPage(pageKey);
        },
       PAGES: {
    HOME: 'HOME',
    PRODUCTS: 'PRODUCTS',
    DASHBOARD: 'DASHBOARD',
    CART: 'CART',
    MODALS: 'MODALS',
    ABOUT: 'ABOUT' // 👈 Add this
}
    };
});