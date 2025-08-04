# GitHub Pages Deployment Guide

This guide explains how to deploy the ElitCards application (including the admin dashboard) to GitHub Pages.

## Overview

The ElitCards application is configured for automatic deployment to GitHub Pages using GitHub Actions. This includes:

- **Main Application**: Customer-facing card purchasing interface
- **Admin Dashboard**: Complete admin panel for managing cards and viewing transactions
- **Email Notifications**: Integrated EmailJS system for transaction alerts
- **PocketBase Integration**: Backend database connectivity

## Deployment URLs

Once deployed, the application will be available at:

- **Main Application**: `https://qwekua.github.io/Elite.Cards.Com/`
- **Admin Dashboard**: `https://qwekua.github.io/Elite.Cards.Com/admin.html`

## Automatic Deployment Setup

### 1. GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
- Triggers on pushes to the `main` branch
- Builds and deploys the application to GitHub Pages
- Handles all static assets and files

### 2. Repository Settings

To enable GitHub Pages deployment:

1. **Go to Repository Settings**:
   - Navigate to your GitHub repository
   - Click on "Settings" tab

2. **Configure Pages**:
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - Save the settings

3. **Enable Actions**:
   - Go to "Actions" tab in your repository
   - Enable GitHub Actions if not already enabled
   - The deployment workflow will run automatically on the next push

## Manual Deployment Steps

If you need to deploy manually or troubleshoot:

### 1. Commit and Push Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Deploy ElitCards application with admin dashboard"

# Push to main branch
git push origin main
```

### 2. Monitor Deployment

1. Go to the "Actions" tab in your GitHub repository
2. Click on the latest workflow run
3. Monitor the deployment progress
4. Check for any errors in the logs

### 3. Verify Deployment

Once deployment completes:
1. Visit the main application URL
2. Test the admin dashboard URL
3. Verify all functionality works correctly

## Configuration for Production

### 1. PocketBase Configuration

Update `config.js` for production deployment:

```javascript
// Production PocketBase URL
const POCKETBASE_URL = 'http://node68.lunes.host:3246';

// Ensure HTTPS context detection works correctly
const isHttpsContext = window.location.protocol === 'https:';
```

### 2. Email Service Configuration

Update `email-config.js` with your actual EmailJS credentials:

```javascript
const EmailConfig = {
    SERVICE_ID: 'your_actual_service_id',
    TEMPLATE_ID: 'your_actual_template_id', 
    PUBLIC_KEY: 'your_actual_public_key',
    ADMIN_EMAIL: 'adomanua@gmail.com'
};
```

### 3. Admin Access

The admin dashboard will be accessible at:
`https://qwekua.github.io/Elite.Cards.Com/admin.html`

Default admin credentials (update these in production):
- Username: `admin`
- Password: `admin123`

## Features Available in Deployed Version

### Main Application
- ✅ Card browsing and purchasing
- ✅ User authentication and registration
- ✅ Shopping cart functionality
- ✅ Payment screenshot upload
- ✅ Email notifications to admin
- ✅ PocketBase integration
- ✅ Responsive mobile design

### Admin Dashboard
- ✅ Admin authentication
- ✅ Card management (add/edit/delete)
- ✅ Transaction viewing and management
- ✅ Payment screenshot review
- ✅ Dashboard statistics
- ✅ PocketBase data synchronization
- ✅ Real-time transaction monitoring

## Troubleshooting

### Common Issues

1. **Deployment Fails**:
   - Check GitHub Actions logs for errors
   - Ensure all files are committed and pushed
   - Verify repository permissions

2. **Pages Not Loading**:
   - Check if GitHub Pages is enabled in repository settings
   - Verify the correct source is selected (GitHub Actions)
   - Wait a few minutes for DNS propagation

3. **Admin Dashboard Not Accessible**:
   - Ensure `admin.html` is in the root directory
   - Check file permissions and case sensitivity
   - Verify all required JavaScript files are included

4. **PocketBase Connection Issues**:
   - Verify PocketBase URL is accessible from GitHub Pages
   - Check CORS settings on PocketBase server
   - Ensure HTTPS/HTTP protocol compatibility

5. **Email Notifications Not Working**:
   - Verify EmailJS credentials in `email-config.js`
   - Check EmailJS service status
   - Test email functionality in browser console

### Debug Commands

Use these in the browser console on the deployed site:

```javascript
// Test PocketBase connection
testPocketBase()

// Test email service
EmailService.testEmailService()

// Check configuration
console.log(CONFIG)
console.log(EmailConfig)

// Debug admin authentication
AdminAuth.testConnection()
```

## Security Considerations

### Production Security
- Change default admin credentials immediately
- Use environment-specific configuration
- Enable HTTPS for all external services
- Regularly update dependencies

### Data Protection
- PocketBase handles sensitive data server-side
- Email notifications use secure EmailJS service
- No sensitive credentials stored in client code
- Payment screenshots stored securely in PocketBase

## Monitoring and Maintenance

### Regular Tasks
1. **Monitor Transactions**: Check admin dashboard regularly
2. **Review Email Notifications**: Ensure admin emails are being received
3. **Update Dependencies**: Keep libraries and services updated
4. **Backup Data**: Regular PocketBase database backups
5. **Performance Monitoring**: Check page load times and functionality

### Analytics
Consider adding analytics to monitor:
- User engagement and conversion rates
- Popular card types and purchasing patterns
- Admin dashboard usage
- Email notification delivery rates

## Support and Documentation

- **Main Documentation**: See README.md
- **Admin Guide**: See ADMIN_GUIDE.md
- **Email Setup**: See EMAIL_SETUP_GUIDE.md
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md

For technical support or deployment issues, check the repository issues or create a new issue with detailed error information.