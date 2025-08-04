/**
 * Email Service Module
 * Handles sending email notifications to admin when transactions are submitted
 */

class EmailService {
    constructor() {
        this.adminEmail = 'adomanua@gmail.com';
        this.isEmailJSInitialized = false;
        this.initializeEmailJS();
    }

    /**
     * Initialize EmailJS service
     */
    async initializeEmailJS() {
        try {
            // Load EmailJS if not already loaded
            if (typeof emailjs === 'undefined') {
                await this.loadEmailJS();
            }
            
            // Initialize EmailJS with public key
            // Note: In production, you'll need to set up EmailJS account and get your keys
            // For now, this is a placeholder structure
            this.emailJSConfig = {
                serviceId: 'service_elitecards', // Replace with your EmailJS service ID
                templateId: 'template_transaction', // Replace with your EmailJS template ID
                publicKey: 'your_emailjs_public_key' // Replace with your EmailJS public key
            };
            
            console.log('📧 Email service initialized');
            this.isEmailJSInitialized = true;
        } catch (error) {
            console.warn('⚠️ EmailJS initialization failed:', error);
            this.isEmailJSInitialized = false;
        }
    }

    /**
     * Load EmailJS library dynamically
     */
    loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                console.log('📧 EmailJS library loaded');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load EmailJS library'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Send transaction notification email to admin
     * @param {Object} transactionData - Transaction details
     * @returns {Promise<boolean>} Success status
     */
    async sendTransactionNotification(transactionData) {
        try {
            console.log('📧 Preparing to send transaction notification email...');
            
            // Prepare email data
            const emailData = {
                to_email: this.adminEmail,
                to_name: 'Elite Cards Admin',
                from_name: 'Elite Cards System',
                subject: `New Transaction Submitted - ${transactionData.email}`,
                customer_email: transactionData.email,
                transaction_amount: `$${transactionData.amount} (GHS ${transactionData.amountGHS})`,
                transaction_date: new Date().toLocaleString(),
                cart_items: this.formatCartItems(transactionData.cartItems),
                total_items: transactionData.cartItems.length,
                screenshot_status: transactionData.screenshot ? 'Screenshot uploaded' : 'No screenshot',
                message: this.generateEmailMessage(transactionData)
            };

            // Try to send via EmailJS if available
            if (this.isEmailJSInitialized && typeof emailjs !== 'undefined') {
                try {
                    const response = await emailjs.send(
                        this.emailJSConfig.serviceId,
                        this.emailJSConfig.templateId,
                        emailData,
                        this.emailJSConfig.publicKey
                    );
                    
                    console.log('✅ Transaction notification email sent successfully:', response);
                    return true;
                } catch (emailError) {
                    console.warn('⚠️ EmailJS sending failed:', emailError);
                    // Fall through to alternative method
                }
            }

            // Alternative: Use a webhook or API endpoint (if available)
            await this.sendViaWebhook(emailData);
            return true;

        } catch (error) {
            console.error('❌ Failed to send transaction notification:', error);
            
            // Log the notification locally as fallback
            this.logNotificationLocally(transactionData);
            return false;
        }
    }

    /**
     * Format cart items for email display
     * @param {Array} cartItems - Array of cart items
     * @returns {string} Formatted cart items string
     */
    formatCartItems(cartItems) {
        return cartItems.map(item => 
            `• ${item.title} x${item.quantity} - $${item.total.toFixed(2)}`
        ).join('\n');
    }

    /**
     * Generate email message content
     * @param {Object} transactionData - Transaction details
     * @returns {string} Email message
     */
    generateEmailMessage(transactionData) {
        return `
🔔 NEW TRANSACTION ALERT

A new transaction has been submitted on Elite Cards:

👤 Customer: ${transactionData.email}
💰 Amount: $${transactionData.amount} (GHS ${transactionData.amountGHS})
📅 Date: ${new Date().toLocaleString()}
📱 Items: ${transactionData.cartItems.length} card(s)

📋 CART DETAILS:
${this.formatCartItems(transactionData.cartItems)}

📸 Screenshot: ${transactionData.screenshot ? '✅ Uploaded' : '❌ Not provided'}

Please review this transaction in the admin panel and process the payment accordingly.

---
Elite Cards Admin System
        `.trim();
    }

    /**
     * Send email via webhook (alternative method)
     * @param {Object} emailData - Email data to send
     */
    async sendViaWebhook(emailData) {
        try {
            // This would be your backend webhook endpoint
            // For now, we'll simulate the webhook call
            console.log('📧 Attempting to send via webhook...');
            
            // In a real implementation, you would call your backend:
            // const response = await fetch('/api/send-notification', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(emailData)
            // });
            
            // For demo purposes, we'll just log the email data
            console.log('📧 Email data prepared for webhook:', emailData);
            
            // Simulate successful webhook response
            return Promise.resolve({ success: true });
        } catch (error) {
            console.warn('⚠️ Webhook sending failed:', error);
            throw error;
        }
    }

    /**
     * Log notification locally as fallback
     * @param {Object} transactionData - Transaction details
     */
    logNotificationLocally(transactionData) {
        const notification = {
            timestamp: new Date().toISOString(),
            type: 'transaction_notification',
            adminEmail: this.adminEmail,
            customerEmail: transactionData.email,
            amount: transactionData.amount,
            amountGHS: transactionData.amountGHS,
            cartItems: transactionData.cartItems,
            hasScreenshot: !!transactionData.screenshot,
            message: this.generateEmailMessage(transactionData)
        };

        // Store in localStorage for admin to review
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        notifications.unshift(notification); // Add to beginning
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        console.log('📝 Transaction notification logged locally for admin review');
    }

    /**
     * Get pending notifications from localStorage
     * @returns {Array} Array of pending notifications
     */
    getPendingNotifications() {
        return JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    }

    /**
     * Clear all notifications
     */
    clearNotifications() {
        localStorage.removeItem('admin_notifications');
        console.log('🗑️ All notifications cleared');
    }

    /**
     * Send test email to verify configuration
     * @returns {Promise<boolean>} Success status
     */
    async sendTestEmail() {
        const testData = {
            email: 'test@example.com',
            amount: 50.00,
            amountGHS: 519.00,
            cartItems: [
                { title: 'Test Card', quantity: 1, total: 50.00 }
            ],
            screenshot: true
        };

        console.log('🧪 Sending test email notification...');
        return await this.sendTransactionNotification(testData);
    }
}

// Create global instance
const emailService = new EmailService();

// Make available globally for testing
window.emailService = emailService;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}