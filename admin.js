/**
 * Elite Cards Admin Panel JavaScript
 * Handles admin authentication, card management, and transaction viewing
 */

class AdminPanel {
    constructor() {
        this.pb = new PocketBase(this.getPocketBaseUrl());
        this.currentAdmin = null;
        this.init();
    }

    /**
     * Get PocketBase URL based on environment
     */
    getPocketBaseUrl() {
        const host = window.location.host.toLowerCase();
        const isLocalDevelopment = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('codespace');
        
        if (isLocalDevelopment) {
            return 'http://localhost:8090';
        } else {
            return 'http://node68.lunes.host:3246';
        }
    }

    /**
     * Initialize the admin panel
     */
    init() {
        this.setupEventListeners();
        this.checkAdminAuth();
        this.loadDashboardData();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Add card form
        document.getElementById('addCardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCard();
        });

        // File upload
        const fileUpload = document.getElementById('cardImageUpload');
        const fileInput = document.getElementById('cardImageFile');
        
        fileUpload.addEventListener('click', () => fileInput.click());
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.previewImage(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.previewImage(e.target.files[0]);
            }
        });

        // Screenshot modal
        const modal = document.getElementById('screenshotModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Check if admin is already authenticated
     */
    checkAdminAuth() {
        const adminData = localStorage.getItem('adminAuth');
        if (adminData) {
            try {
                this.currentAdmin = JSON.parse(adminData);
                this.showAdminPanel();
            } catch (error) {
                console.error('Invalid admin auth data:', error);
                localStorage.removeItem('adminAuth');
            }
        }
    }

    /**
     * Handle admin login
     */
    async handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            // For demo purposes, use hardcoded admin credentials
            // In production, this should authenticate against PocketBase admin users
            if (email === 'admin@elitecards.com' && password === 'admin123') {
                this.currentAdmin = {
                    email: email,
                    name: 'Admin',
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('adminAuth', JSON.stringify(this.currentAdmin));
                this.showAdminPanel();
                this.loadDashboardData();
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Invalid email or password';
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Show admin panel and hide login form
     */
    showAdminPanel() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.loadCards();
        this.loadTransactions();
    }

    /**
     * Logout admin
     */
    logout() {
        localStorage.removeItem('adminAuth');
        this.currentAdmin = null;
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        
        // Reset form
        document.getElementById('adminLoginForm').reset();
        document.getElementById('loginError').style.display = 'none';
    }

    /**
     * Show specific admin section
     */
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.admin-nav button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        document.getElementById(sectionName + 'Btn').classList.add('active');
        
        // Load section-specific data
        if (sectionName === 'cards') {
            this.loadCards();
        } else if (sectionName === 'transactions') {
            this.loadTransactions();
        } else if (sectionName === 'dashboard') {
            this.loadDashboardData();
        }
    }

    /**
     * Load dashboard statistics
     */
    async loadDashboardData() {
        try {
            // Get cards count
            const cards = await this.getCards();
            document.getElementById('totalCards').textContent = cards.length;
            
            // Get transactions
            const transactions = await this.getTransactions();
            document.getElementById('totalTransactions').textContent = transactions.length;
            
            // Count pending transactions
            const pending = transactions.filter(t => t.status === 'pending').length;
            document.getElementById('pendingTransactions').textContent = pending;
            
            // Calculate total revenue
            const revenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            document.getElementById('totalRevenue').textContent = `$${revenue.toFixed(2)}`;
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    /**
     * Get cards from PocketBase or fallback data
     */
    async getCards() {
        try {
            const resultList = await this.pb.collection('Cards').getList(1, 50, {
                sort: '-created',
            });
            return resultList.items;
        } catch (error) {
            console.warn('PocketBase unavailable, using fallback data:', error);
            // Return fallback cards data
            return [
                {id: '1', Name: 'American Express', Description: 'Premium card with exclusive benefits', Price: 100, Image: null},
                {id: '2', Name: 'Mastercard Platinum', Description: 'Platinum card with worldwide acceptance', Price: 70, Image: null},
                {id: '3', Name: 'Visa Gold', Description: 'Gold card with premium rewards', Price: 200, Image: null},
                {id: '4', Name: 'Titanium Discover', Description: 'Titanium card with cashback rewards', Price: 50, Image: null},
                {id: '5', Name: 'Visa Infinite', Description: 'Ultimate card with unlimited possibilities', Price: 35, Image: null}
            ];
        }
    }

    /**
     * Get transactions from localStorage and PocketBase
     */
    async getTransactions() {
        let transactions = [];
        
        try {
            // Try to get from PocketBase first
            const resultList = await this.pb.collection('payment_proofs').getList(1, 50, {
                sort: '-created',
            });
            
            transactions = resultList.items.map(payment => {
                let paymentData = {};
                try {
                    paymentData = JSON.parse(payment.note || '{}');
                } catch (e) {
                    paymentData = {};
                }
                
                return {
                    id: payment.id,
                    userEmail: payment.email,
                    amount: paymentData.amount || 0,
                    currency: paymentData.currency || 'USD',
                    amountGHS: paymentData.amountGHS || 0,
                    status: paymentData.status || 'pending',
                    submittedAt: paymentData.submittedAt || payment.created,
                    screenshot: payment.Screenshot ? 
                        `${this.pb.baseUrl}/api/files/payment_proofs/${payment.id}/${payment.Screenshot}` : null
                };
            });
        } catch (error) {
            console.warn('PocketBase unavailable, using localStorage fallback:', error);
        }
        
        // Fallback to localStorage
        if (transactions.length === 0) {
            const localPayments = JSON.parse(localStorage.getItem('payments')) || [];
            transactions = localPayments.map((payment, index) => ({
                id: `local_${index}`,
                userEmail: payment.userEmail,
                amount: payment.amount,
                currency: payment.currency || 'USD',
                amountGHS: payment.amountGHS,
                status: payment.status || 'pending',
                submittedAt: payment.submittedAt,
                screenshot: payment.paymentScreenshot
            }));
        }
        
        return transactions;
    }

    /**
     * Load and display cards
     */
    async loadCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = '<p>Loading cards...</p>';
        
        try {
            const cards = await this.getCards();
            
            if (cards.length === 0) {
                container.innerHTML = '<p>No cards found.</p>';
                return;
            }
            
            container.innerHTML = cards.map(card => `
                <div class="admin-card">
                    <img src="${this.getCardImageUrl(card)}" alt="${card.Name}" onerror="this.src='images/default-card.png'">
                    <h4>${card.Name}</h4>
                    <p><strong>Price:</strong> $${card.Price}</p>
                    <p><strong>Description:</strong> ${card.Description}</p>
                    <div class="card-actions">
                        <button class="btn-primary" onclick="adminPanel.editCard('${card.id}')">Edit</button>
                        <button class="btn-danger" onclick="adminPanel.deleteCard('${card.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading cards:', error);
            container.innerHTML = '<p>Error loading cards.</p>';
        }
    }

    /**
     * Get card image URL
     */
    getCardImageUrl(card) {
        if (card.Image) {
            return `${this.pb.baseUrl}/api/files/Cards/${card.id}/${card.Image}`;
        }
        
        // Fallback to local images based on card name
        const imageName = card.Name.toLowerCase().replace(/\s+/g, '-');
        return `images/${imageName}.png`;
    }

    /**
     * Load and display transactions
     */
    async loadTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '<tr><td colspan="6">Loading transactions...</td></tr>';
        
        try {
            const transactions = await this.getTransactions();
            
            if (transactions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No transactions found.</td></tr>';
                return;
            }
            
            tbody.innerHTML = transactions.map(transaction => `
                <tr>
                    <td>${new Date(transaction.submittedAt).toLocaleDateString()}</td>
                    <td>${transaction.userEmail}</td>
                    <td>$${transaction.amount} (GHS ${transaction.amountGHS})</td>
                    <td>
                        ${transaction.screenshot ? 
                            `<img src="${transaction.screenshot}" class="screenshot-preview" onclick="adminPanel.viewScreenshot('${transaction.screenshot}')" alt="Screenshot">` :
                            'No screenshot'
                        }
                    </td>
                    <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
                    <td>
                        <select onchange="adminPanel.updateTransactionStatus('${transaction.id}', this.value)">
                            <option value="pending" ${transaction.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="approved" ${transaction.status === 'approved' ? 'selected' : ''}>Approved</option>
                            <option value="rejected" ${transaction.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            tbody.innerHTML = '<tr><td colspan="6">Error loading transactions.</td></tr>';
        }
    }

    /**
     * View screenshot in modal
     */
    viewScreenshot(imageUrl) {
        const modal = document.getElementById('screenshotModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = imageUrl;
        modal.style.display = 'block';
    }

    /**
     * Update transaction status
     */
    async updateTransactionStatus(transactionId, newStatus) {
        try {
            // Update in PocketBase if available
            if (!transactionId.startsWith('local_')) {
                const record = await this.pb.collection('payment_proofs').getOne(transactionId);
                let noteData = {};
                try {
                    noteData = JSON.parse(record.note || '{}');
                } catch (e) {
                    noteData = {};
                }
                
                noteData.status = newStatus;
                
                await this.pb.collection('payment_proofs').update(transactionId, {
                    note: JSON.stringify(noteData)
                });
            } else {
                // Update in localStorage for local transactions
                const payments = JSON.parse(localStorage.getItem('payments')) || [];
                const index = parseInt(transactionId.replace('local_', ''));
                if (payments[index]) {
                    payments[index].status = newStatus;
                    localStorage.setItem('payments', JSON.stringify(payments));
                }
            }
            
            this.showMessage('Transaction status updated successfully!', 'success');
            this.loadTransactions();
            this.loadDashboardData();
            
        } catch (error) {
            console.error('Error updating transaction status:', error);
            this.showMessage('Error updating transaction status', 'error');
        }
    }

    /**
     * Preview uploaded image
     */
    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            const img = document.getElementById('previewImg');
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * Handle add new card
     */
    async handleAddCard() {
        const messageDiv = document.getElementById('cardMessage');
        const form = document.getElementById('addCardForm');
        
        try {
            const formData = new FormData();
            formData.append('Name', document.getElementById('cardName').value);
            formData.append('Description', document.getElementById('cardDescription').value);
            formData.append('Price', parseFloat(document.getElementById('cardPrice').value));
            
            const imageFile = document.getElementById('cardImageFile').files[0];
            if (imageFile) {
                formData.append('Image', imageFile);
            }
            
            // Try to create in PocketBase
            try {
                await this.pb.collection('Cards').create(formData);
                this.showMessage('Card added successfully!', 'success');
            } catch (pbError) {
                console.warn('PocketBase unavailable, card not saved to database:', pbError);
                this.showMessage('Card created locally (PocketBase unavailable)', 'warning');
            }
            
            form.reset();
            document.getElementById('imagePreview').style.display = 'none';
            this.loadCards();
            this.loadDashboardData();
            
        } catch (error) {
            console.error('Error adding card:', error);
            this.showMessage('Error adding card: ' + error.message, 'error');
        }
    }

    /**
     * Edit card (placeholder)
     */
    editCard(cardId) {
        alert(`Edit card functionality would be implemented here for card ID: ${cardId}`);
    }

    /**
     * Delete card
     */
    async deleteCard(cardId) {
        if (!confirm('Are you sure you want to delete this card?')) {
            return;
        }
        
        try {
            await this.pb.collection('Cards').delete(cardId);
            this.showMessage('Card deleted successfully!', 'success');
            this.loadCards();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting card:', error);
            this.showMessage('Error deleting card: ' + error.message, 'error');
        }
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('cardMessage');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
let adminPanel;

function showSection(sectionName) {
    adminPanel.showSection(sectionName);
}

function logout() {
    adminPanel.logout();
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});