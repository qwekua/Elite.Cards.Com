# Elite Cards Admin Panel Guide

## 🎯 Overview

The Elite Cards Admin Panel is a comprehensive backend management system that allows administrators to:
- Manage card inventory (add, edit, delete cards)
- View and manage transaction screenshots
- Monitor business statistics
- Handle customer payment approvals

## 🔐 Admin Access

### Login Credentials
- **URL**: `admin.html`
- **Email**: `admin@elitecards.com`
- **Password**: `admin123`

### Security Features
- Session-based authentication
- Secure logout functionality
- Protected admin routes

## 📊 Dashboard Features

### Statistics Overview
The dashboard displays real-time business metrics:
- **Total Cards**: Number of cards in inventory
- **Total Transactions**: All customer transactions
- **Pending Reviews**: Transactions awaiting approval
- **Total Revenue**: Sum of all approved transactions

## 💳 Card Management

### View Cards
- Browse all available cards with images
- View card details (name, price, description)
- See card images with proper fallback handling

### Add New Cards
Complete form with the following fields:
- **Card Name**: e.g., "Visa Platinum"
- **Description**: Card benefits and features
- **Price (USD)**: Card cost in dollars
- **Credit Limit**: e.g., "$5,000"
- **Card Image**: Drag-and-drop upload (PNG/JPG, max 2MB)

### Edit/Delete Cards
- **Edit**: Modify existing card details
- **Delete**: Remove cards from inventory (with confirmation)

## 💰 Transaction Management

### Transaction Table
View all customer transactions with:
- **Date**: Transaction submission date
- **User Email**: Customer's email address
- **Amount**: Transaction amount (USD and GHS)
- **Screenshot**: Payment proof image (clickable to view full size)
- **Status**: Current transaction status
- **Actions**: Status management dropdown

### Transaction Status Management
Change transaction status between:
- **Pending**: Awaiting admin review
- **Approved**: Transaction confirmed
- **Rejected**: Transaction declined

### Screenshot Viewer
- Click on screenshot thumbnails to view full-size images
- Modal popup with high-resolution image display
- Easy navigation and closing

## 🔧 Technical Integration

### PocketBase Integration
- **Primary**: Connects to PocketBase database for live data
- **Fallback**: Uses localStorage when PocketBase unavailable
- **Collections**: 
  - `Cards`: Card inventory management
  - `payment_proofs`: Transaction screenshots and data

### Environment Detection
- **Development**: Uses `http://localhost:8090`
- **Production**: Uses `http://node68.lunes.host:3246`
- **Fallback**: Graceful degradation to local data

## 🎨 User Interface

### Design Features
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface
- **Intuitive Navigation**: Easy-to-use tab system
- **Visual Feedback**: Success/error messages
- **Drag-and-Drop**: File upload functionality

### Navigation Structure
```
📊 Dashboard     - Business overview and statistics
💳 Manage Cards  - View, edit, delete existing cards
💰 Transactions  - View and manage payment screenshots
➕ Add New Card  - Create new card listings
```

## 🚀 Getting Started

### 1. Access Admin Panel
```
Open: admin.html
Login with admin credentials
```

### 2. Review Dashboard
- Check current statistics
- Monitor pending transactions
- Review business performance

### 3. Manage Cards
- Add new card products
- Update existing card details
- Remove discontinued cards

### 4. Process Transactions
- Review payment screenshots
- Approve/reject transactions
- Monitor customer payments

## 📱 Mobile Compatibility

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Considerations

### Production Deployment
For production use, consider:
- Implementing proper admin user management
- Adding role-based access control
- Using HTTPS for all connections
- Implementing session timeouts
- Adding audit logging

### Data Protection
- Transaction screenshots are securely stored
- Customer data is protected
- Admin sessions are managed securely

## 🛠️ Troubleshooting

### Common Issues

**PocketBase Connection Issues**
- Check PocketBase server status
- Verify network connectivity
- System falls back to localStorage automatically

**Image Upload Problems**
- Ensure file size is under 2MB
- Use PNG or JPG formats only
- Check browser permissions

**Login Issues**
- Verify credentials are correct
- Clear browser cache if needed
- Check console for error messages

## 📞 Support

For technical support or questions about the admin panel:
- Check console logs for error details
- Verify PocketBase server connectivity
- Review network requests in browser dev tools

---

**Admin Panel Version**: 1.0  
**Last Updated**: 2025-01-04  
**Compatible with**: Elite Cards v1.0+