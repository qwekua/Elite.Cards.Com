/**
 * Email Service Configuration
 * 
 * This file contains the EmailJS configuration for sending admin notifications.
 * You need to set up an EmailJS account and configure these values.
 */

const EmailConfig = {
    // EmailJS Configuration
    // Get these values from your EmailJS dashboard: https://www.emailjs.com/
    SERVICE_ID: 'service_ctpg96v',        // Replace with your EmailJS service ID
    TEMPLATE_ID: 'your_template_id_here',      // Replace with your EmailJS template ID
    PUBLIC_KEY: 'your_public_key_here',        // Replace with your EmailJS public key
    
    // Admin email address
    ADMIN_EMAIL: 'adomanuacquah.dev@gmail.com',
    
    // Email template parameters (these will be passed to the EmailJS template)
    TEMPLATE_PARAMS: {
        to_email: 'adomanuacquah.dev@gmail.com',
        from_name: 'ElitCards System',
        subject: 'New Transaction Notification - ElitCards'
    }
};

// Make config available globally
window.EmailConfig = EmailConfig;