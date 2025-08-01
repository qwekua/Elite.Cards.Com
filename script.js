/**
 * Main Application Script
 * 
 * This script handles the UI interactions and application logic.
 * It uses the database module (db.js) for data operations.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for pages to be initialized
    if (!window.Pages) {
        console.error('Pages system not initialized');
        return;
    }
    // DOM Elements - Static elements that exist in index.html
    const mainContent = document.getElementById('main-content');
    const cartCount = document.querySelector('.cart-count');
    const footerCartCount = document.querySelector('.footer-cart-count');
    const notification = document.getElementById('notification');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    // Navigation links - these are static and can be queried once
    const homeLinks = document.querySelectorAll('.home-link');
    const productsLinks = document.querySelectorAll('.products-link');
    // Navigation links
    const supportLinks = document.querySelectorAll('.support-link');
    const cartLinks = document.querySelectorAll('.cart-link');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    // Initialize the app
    init();

    // Render products to the grid
    function renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) {
            console.error('Products grid not found');
            return;
        }
        
        productsGrid.innerHTML = '';
        const products = db.getProducts();
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            
            // Determine card type based on title
            let cardType = '';
            if (product.title.toLowerCase().includes('gold')) {
                cardType = 'gold-card';
            } else if (product.title.toLowerCase().includes('black')) {
                cardType = 'black-card';
            } else if (product.title.toLowerCase().includes('platinum')) {
                cardType = 'platinum-card';
            } else if (product.title.toLowerCase().includes('diamond')) {
                cardType = 'diamond-card';
            } else if (product.title.toLowerCase().includes('infinite')) {
                cardType = 'infinite-card';
            } else if (product.title.toLowerCase().includes('world')) {
                cardType = 'world-card';
            }
            
            productCard.className = `product-card ${cardType}`;
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-number">${product.number}</p>
                    <p class="product-limit">${product.limit}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="price-conversion">GHS ${db.usdToGhs(product.price)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    // Update cart count in navbar and footer
    function updateCartCount() {
        const count = db.getCartCount();
        cartCount.textContent = count;
        footerCartCount.textContent = count;
    }

    // Render cart items
    function renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        
        if (!cartItems || !cartSummary) {
            console.error('Cart elements not found');
            return;
        }
        
        const cart = db.getCart();
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is empty. Browse our <a href="#" class="products-link">premium cards</a> to get started.</p>
                </div>
            `;
            cartSummary.style.display = 'none';
            return;
        }

        cartItems.innerHTML = '';
        let subtotal = db.getCartSubtotal();
        const products = db.getProducts();

        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            
            // Determine card type based on title
            let cardType = '';
            if (product.title.toLowerCase().includes('gold')) {
                cardType = 'gold-card';
            } else if (product.title.toLowerCase().includes('black')) {
                cardType = 'black-card';
            } else if (product.title.toLowerCase().includes('platinum')) {
                cardType = 'platinum-card';
            } else if (product.title.toLowerCase().includes('diamond')) {
                cardType = 'diamond-card';
            } else if (product.title.toLowerCase().includes('infinite')) {
                cardType = 'infinite-card';
            } else if (product.title.toLowerCase().includes('world')) {
                cardType = 'world-card';
            }
            
            const cartItem = document.createElement('div');
            cartItem.className = `cart-item ${cardType}-cart-item`;
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="cart-item-details">
                    <h3>${product.title}</h3>
                    <p class="cart-item-number">${product.number}</p>
                </div>
                <div class="cart-item-price">$${(product.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-conversion">GHS ${db.usdToGhs(product.price * item.quantity)}</div>
                <button class="remove-item" data-id="${product.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });

        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTotal = document.getElementById('cart-total');
        const paymentAmount = document.getElementById('payment-amount');
        
        if (cartSubtotal) cartSubtotal.textContent = db.formatPrice(subtotal);
        if (cartTotal) cartTotal.textContent = db.formatPrice(subtotal + 1); // Adding $1 service fee
        if (paymentAmount) paymentAmount.textContent = db.formatPrice(subtotal + 1);
        
        cartSummary.style.display = 'block';
    }

    // Add to cart
    function addToCart(productId) {
        db.addToCart(productId);
        updateCartCount();
        showNotification('Item added to cart', 'success');
    }

    // Remove from cart
    function removeFromCart(productId) {
        db.removeFromCart(productId);
        updateCartCount();
        renderCart();
        showNotification('Item removed from cart', 'success');
    }

    // Show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Check auth state and update UI
    function checkAuthState() {
        const currentUser = db.getCurrentUser();
        
        if (currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.style.display = 'block';
            
            const dashboardLinks = document.querySelectorAll('.dashboard-link');
            dashboardLinks.forEach(link => link.style.display = 'block');
            
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) usernameDisplay.textContent = currentUser.name.split(' ')[0];
            
            const userEmail = document.getElementById('user-email');
            if (userEmail) userEmail.textContent = currentUser.email;
            
            const joinDate = document.getElementById('join-date');
            if (joinDate) joinDate.textContent = new Date(currentUser.joinDate).toLocaleDateString();
            
            const paymentEmail = document.getElementById('payment-email');
            if (paymentEmail) paymentEmail.value = currentUser.email;
        } else {
            // User is logged out
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            const dashboardLinks = document.querySelectorAll('.dashboard-link');
            dashboardLinks.forEach(link => link.style.display = 'none');
            
            const paymentEmail = document.getElementById('payment-email');
            if (paymentEmail) paymentEmail.value = '';
        }
    }

    // Login user
    function login(email, password) {
        const user = db.findUser(email, password);
        
        if (user) {
            db.setCurrentUser(user);
            checkAuthState();
            hideModal(document.getElementById('auth-modal'));
            showNotification('Login successful', 'success');
            showSection('dashboard-section');
        } else {
            showNotification('Invalid email or password', 'error');
        }
    }

    // Register user
    function register(name, email, password) {
        // Check if user already exists
        if (db.userExists(email)) {
            showNotification('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            name,
            email,
            password,
            
        };
        
        db.addUser(newUser);
        db.setCurrentUser(newUser);
        
        checkAuthState();
        hideModal(document.getElementById('auth-modal'));
        showNotification('Registration successful', 'success');
        showSection('dashboard-section');
    }

    // Logout user
    function logout() {
        db.setCurrentUser(null);
        checkAuthState();
        showNotification('Logged out successfully', 'success');
        showSection('home-section');
    }

    // Show modal
    function showModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal element not found');
        }
    }

    // Hide modal
    function hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else {
            console.error('Modal element not found');
        }
    }

    // Show section using pages system
    async function showSection(sectionId) {
        let pageKey;
        
        switch(sectionId) {
            case 'home-section':
                pageKey = Pages.PAGES.HOME;
                break;
            case 'products-section':
                pageKey = Pages.PAGES.PRODUCTS;
                break;
            case 'dashboard-section':
                pageKey = Pages.PAGES.DASHBOARD;
                break;
            case 'cart-section':
                pageKey = Pages.PAGES.CART;
                break;
            default:
                pageKey = Pages.PAGES.HOME;
        }
        
        await Pages.load(pageKey);
        window.scrollTo(0, 0);
        
        // Re-initialize any dynamic content in the loaded component
        if (sectionId === 'products-section') {
            renderProducts();
        } else if (sectionId === 'cart-section') {
            renderCart();
        } else if (sectionId === 'dashboard-section') {
            // Update dashboard content
            const currentUser = db.getCurrentUser();
            if (currentUser) {
                const usernameDisplay = document.getElementById('username-display');
                const userEmail = document.getElementById('user-email');
                const joinDate = document.getElementById('join-date');
                
                if (usernameDisplay) usernameDisplay.textContent = currentUser.name.split(' ')[0];
                if (userEmail) userEmail.textContent = currentUser.email;
                if (joinDate) joinDate.textContent = new Date(currentUser.joinDate).toLocaleDateString();
            }
        }
    }

    // Initialize the app
    function init() {
        updateCartCount();
        checkAuthState();
        setupEventListeners();
        
        // Initial page is loaded by pages.js
    }

    // Setup event listeners
    // Set active navigation item
    function setActiveNavItem(linkClass) {
        // Remove active class from all navigation items
        document.querySelectorAll('.nav-links a, .footer-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to matching navigation items
        document.querySelectorAll(`.${linkClass}`).forEach(item => {
            item.classList.add('active');
        });
    }
    
    function setupEventListeners() {
        // Mobile menu functionality
        const navLinks = document.querySelector('.nav-links');
        const authButtons = document.querySelector('.auth-buttons');
        const overlay = document.querySelector('.overlay');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        
        // Function to close mobile menu
        function closeMobileMenu() {
            navLinks.classList.remove('active');
            authButtons.classList.remove('active');
            overlay.classList.remove('active');
        }
        
        // Close mobile menu when clicking the close button
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
            });
        }
        
        // Close mobile menu when clicking the overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeMobileMenu();
            });
        }
        
        // Close mobile menu when clicking any navigation link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                // Remove active class from all links
                document.querySelectorAll('.nav-links a').forEach(l => {
                    l.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Close mobile menu
                closeMobileMenu();
            });
        });

        // Navigation links
        homeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('home-section');
                setActiveNavItem('home-link');
                closeMobileMenu();
            });
        });

        productsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!db.getCurrentUser()) {
                    showNotification('Please login to browse cards', 'error');
                    showModal(document.getElementById('auth-modal'));
                } else {
                    showSection('products-section');
                    setActiveNavItem('products-link');
                }
                closeMobileMenu();
            });
        });

        // Features link removed


        // Support link
        supportLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Support is available 24/7 via email at support@elitcards.com', 'success');
                closeMobileMenu();
            });
        });

        // Dashboard links
        document.querySelectorAll('.dashboard-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('dashboard-section');
                setActiveNavItem('account-link');
                closeMobileMenu();
            });
        });

        cartLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!db.getCurrentUser()) {
                    showNotification('Please login to view your cart', 'error');
                    showModal(document.getElementById('auth-modal'));
                } else {
                    renderCart();
                    showSection('cart-section');
                    setActiveNavItem('cart-link');
                }
                closeMobileMenu();
            });
        });

        // Use event delegation for dynamically loaded elements
        document.addEventListener('click', (e) => {
            // Browse cards button
            if (e.target.id === 'browse-cards-btn' || e.target.closest('#browse-cards-btn')) {
                e.preventDefault();
                if (!db.getCurrentUser()) {
                    showNotification('Please login to browse cards', 'error');
                    showModal(document.getElementById('auth-modal'));
                } else {
                    showSection('products-section');
                    setActiveNavItem('products-link');
                }
                closeMobileMenu();
            }
            
            // Dashboard browse button
            if (e.target.id === 'dashboard-browse-btn' || e.target.closest('#dashboard-browse-btn')) {
                e.preventDefault();
                showSection('products-section');
                setActiveNavItem('products-link');
                closeMobileMenu();
            }
            
            // Checkout button
            if (e.target.id === 'checkout-btn' || e.target.closest('#checkout-btn')) {
                e.preventDefault();
                showModal(document.getElementById('payment-modal'));
            }
            
            // Confirm payment button
            if (e.target.id === 'confirm-payment-btn' || e.target.closest('#confirm-payment-btn')) {
                e.preventDefault();
                const paymentEmail = document.getElementById('payment-email');
                const paymentScreenshot = document.getElementById('payment-screenshot');
                
                if (!paymentEmail || !paymentEmail.value) {
                    showNotification('Please enter your email address', 'error');
                    return;
                }
                
                if (!paymentScreenshot || !paymentScreenshot.files[0]) {
                    showNotification('Please upload payment screenshot', 'error');
                    return;
                }
                
                hideModal(document.getElementById('payment-modal'));
                setTimeout(() => {
                    showModal(document.getElementById('success-modal'));
                    // Clear cart after successful payment
                    db.clearCart();
                    updateCartCount();
                }, 500);
            }
            
            // Logout button
            if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
                logout();
            }
        });

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.getAttribute('data-id'));
                addToCart(productId);
            }
        });

        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const productId = parseInt(button.getAttribute('data-id'));
                removeFromCart(productId);
            }
        });

        // Payment screenshot upload - using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#upload-section')) {
                const paymentScreenshot = document.getElementById('payment-screenshot');
                if (paymentScreenshot) {
                    paymentScreenshot.click();
                }
            }
        });
        
        // File input change event - using event delegation
        document.addEventListener('change', (e) => {
            if (e.target.id === 'payment-screenshot') {
                const file = e.target.files[0];
                if (file) {
                    const previewImage = document.getElementById('preview-image');
                    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
                    
                    if (previewImage && confirmPaymentBtn) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            previewImage.src = event.target.result;
                            previewImage.style.display = 'block';
                            confirmPaymentBtn.disabled = false;
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        });

        // Auth modal tabs - using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-tab')) {
                const authTabs = document.querySelectorAll('.auth-tab');
                const authForms = document.querySelectorAll('.auth-form');
                
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                e.target.classList.add('active');
                const tabName = e.target.getAttribute('data-tab');
                const form = document.getElementById(`${tabName}-form`);
                if (form) {
                    form.classList.add('active');
                }
            }
            
            // Switch auth links
            if (e.target.classList.contains('switch-auth')) {
                e.preventDefault();
                const tabName = e.target.textContent === 'Login' ? 'login' : 'register';
                const authTabs = document.querySelectorAll('.auth-tab');
                const authForms = document.querySelectorAll('.auth-form');
                
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                const tab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
                const form = document.getElementById(`${tabName}-form`);
                
                if (tab && form) {
                    tab.classList.add('active');
                    form.classList.add('active');
                }
            }
        });
        
        // Form submissions - using event delegation
        document.addEventListener('submit', (e) => {
            // Login form
            if (e.target.id === 'login-form') {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                login(email, password);
            }
            
            // Register form
            if (e.target.id === 'register-form') {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirm = document.getElementById('register-confirm').value;
                
                if (password !== confirm) {
                    showNotification('Passwords do not match', 'error');
                    return;
                }
                
                register(name, email, password);
            }
        });

        // Login/Register buttons - these exist in the main HTML
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                showModal(authModal);
                const authTabs = document.querySelectorAll('.auth-tab');
                const authForms = document.querySelectorAll('.auth-form');
                
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                const loginForm = document.getElementById('login-form');
                
                if (loginTab && loginForm) {
                    loginTab.classList.add('active');
                    loginForm.classList.add('active');
                }
            }
        });

        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                showModal(authModal);
                const authTabs = document.querySelectorAll('.auth-tab');
                const authForms = document.querySelectorAll('.auth-form');
                
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
                const registerForm = document.getElementById('register-form');
                
                if (registerTab && registerForm) {
                    registerTab.classList.add('active');
                    registerForm.classList.add('active');
                }
            }
        });

        // Close modal buttons
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal-overlay');
                hideModal(modal);
            });
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                hideModal(e.target);
            }
        });

        // Prevent clicks on login/register buttons from triggering hamburger menu
        document.addEventListener('click', (e) => {
            // If clicking on login/register buttons or their children, don't toggle mobile menu
            if (e.target.closest('#login-btn') || e.target.closest('#register-btn')) {
                e.stopPropagation();
            }
        });
    }
});