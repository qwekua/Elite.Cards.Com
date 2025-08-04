# Email Notification Setup Guide

This guide will help you set up email notifications for transaction submissions in the ElitCards application.

## Overview

The email notification system uses EmailJS to send notifications to the admin (adomanua@gmail.com) whenever a customer submits a transaction screenshot. The system includes:

- **EmailJS Integration**: Cloud-based email service
- **Admin Notifications**: Automatic emails with transaction details
- **Fallback System**: Graceful handling if email service is unavailable
- **Transaction Details**: Complete order information in emails

## Setup Steps

### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Configure Email Service

1. **Add Email Service**:
   - Go to "Email Services" in your EmailJS dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Note down your **Service ID**

2. **Create Email Template**:
   - Go to "Email Templates" in your dashboard
   - Click "Create New Template"
   - Use this template structure:

```html
Subject: New Transaction - ElitCards Purchase

Hello Admin,

A new transaction has been submitted on ElitCards:

Customer Details:
- Email: {{customer_email}}
- Transaction ID: {{payment_id}}
- Timestamp: {{timestamp}}

Order Details:
- Total Amount: ${{amount}} USD (GHS {{amount_ghs}})
- Items: {{cart_items}}

The customer has uploaded a payment screenshot for verification.

Please review this transaction in your admin panel.

Best regards,
ElitCards System
```

   - Save the template and note down your **Template ID**

3. **Get Public Key**:
   - Go to "Account" → "General"
   - Copy your **Public Key**

### 3. Update Configuration

1. Open `email-config.js` in your project
2. Replace the placeholder values:

```javascript
const EmailConfig = {
    SERVICE_ID: 'your_actual_service_id',      // From step 2.1
    TEMPLATE_ID: 'your_actual_template_id',    // From step 2.2
    PUBLIC_KEY: 'your_actual_public_key',      // From step 2.3
    
    ADMIN_EMAIL: 'adomanua@gmail.com',         // Keep as is
    
    TEMPLATE_PARAMS: {
        to_email: 'adomanua@gmail.com',        // Keep as is
        from_name: 'ElitCards System',         // Keep as is
        subject: 'New Transaction Notification - ElitCards'  // Keep as is
    }
};
```

### 4. Test the Setup

1. **Test Email Service**:
   ```javascript
   // Open browser console and run:
   EmailService.testEmailService()
   ```

2. **Test Transaction Email**:
   ```javascript
   // Open browser console and run:
   EmailService.sendTransactionNotification({
       customerEmail: 'test@example.com',
       amount: 25.00,
       amountGHS: 400.00,
       cartItems: [{ title: 'Test Card', quantity: 1, total: 25.00 }],
       paymentId: 'TEST123',
       timestamp: new Date().toISOString()
   })
   ```

## Email Template Variables

The following variables are available in your EmailJS template:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{customer_email}}` | Customer's email address | `customer@example.com` |
| `{{amount}}` | Total amount in USD | `25.00` |
| `{{amount_ghs}}` | Total amount in GHS | `400.00` |
| `{{cart_items}}` | Formatted list of items | `Visa Gold x1 ($25.00)` |
| `{{payment_id}}` | Transaction/Payment ID | `abc123def456` |
| `{{timestamp}}` | Transaction timestamp | `2024-01-15T10:30:00Z` |

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check EmailJS service status
   - Verify Service ID, Template ID, and Public Key
   - Check browser console for errors

2. **Template not found**:
   - Ensure Template ID is correct
   - Check template is published in EmailJS dashboard

3. **Service authentication failed**:
   - Verify email service configuration
   - Check if email service requires re-authentication

### Debug Commands

Use these commands in the browser console:

```javascript
// Check email configuration
console.log(EmailConfig);

// Test email service connection
EmailService.testEmailService();

// Check if EmailJS is loaded
console.log(typeof emailjs);

// View recent email attempts
EmailService.getEmailHistory();
```

## Security Notes

- EmailJS Public Key is safe to expose in client-side code
- Email templates are processed server-side by EmailJS
- No sensitive data is stored in the client application
- All email sending is rate-limited by EmailJS

## Features

### Automatic Notifications
- Triggered after successful payment submission
- Includes complete transaction details
- Formatted for easy admin review

### Fallback Handling
- Email failures don't affect payment processing
- Errors are logged for debugging
- Graceful degradation if EmailJS is unavailable

### Admin Integration
- Works with existing admin panel
- Transaction IDs match admin records
- Consistent data formatting

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify EmailJS dashboard for service status
3. Test with the provided debug commands
4. Review the EMAIL_SETUP_GUIDE.md for configuration steps

For EmailJS-specific issues, consult the [EmailJS Documentation](https://www.emailjs.com/docs/).