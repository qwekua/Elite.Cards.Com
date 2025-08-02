# Elite Cards - Frontend to NodeLumes PocketBase Connection Guide

This guide explains how to connect your hosted frontend to your PocketBase server running on NodeLumes.

## 🔧 Current Configuration

Your application is configured to connect to:
- **PocketBase Server**: `http://node68.lunes.host:3246`
- **Collection**: `payment_proofs`
- **Auto-detection**: Environment-based configuration

## 🌐 Hosting Scenarios

### 1. **HTTP Frontend Hosting (Recommended)**

**Best compatibility with your NodeLumes PocketBase server**

✅ **Advantages:**
- Direct connection to HTTP PocketBase server
- No mixed content issues
- Full functionality including file uploads

📋 **Hosting Options:**
- Netlify (with HTTP-only deployment)
- Vercel (with HTTP configuration)
- GitHub Pages (custom domain with HTTP)
- Any HTTP-enabled hosting service

### 2. **HTTPS Frontend Hosting (Requires Additional Setup)**

**May have mixed content restrictions**

⚠️ **Challenges:**
- HTTPS frontend → HTTP PocketBase = Mixed content blocked
- Modern browsers block HTTP requests from HTTPS pages
- File uploads may fail due to security policies

💡 **Solutions:**
1. **Upgrade PocketBase to HTTPS** (Recommended)
2. **Use a reverse proxy** with SSL termination
3. **Configure browser exceptions** (development only)

## 🚀 Deployment Steps

### Step 1: Upload Your Files

Upload all files to your hosting service:
```
├── index.html
├── config.js          ← Configuration file
├── db.js              ← Database connection
├── script.js          ← Main application
├── pages.js           ← Page routing
├── styles.css         ← Styling
├── components/        ← UI components
├── images/           ← Assets
└── pages/            ← Page templates
```

### Step 2: Verify Configuration

The application will automatically:
- Detect your hosting environment
- Configure PocketBase connection
- Show detailed logs in browser console

### Step 3: Test Connection

1. Open browser developer tools (F12)
2. Check console for connection status
3. Look for these messages:
   ```
   ⚙️ Elite Cards Configuration Loaded
   🔧 Database Configuration: Production
   🔗 PocketBase URL: http://node68.lunes.host:3246
   ```

### Step 4: Test Payment Submission

1. Add items to cart
2. Proceed to checkout
3. Upload a test image
4. Submit payment
5. Check console for success/error messages

## 🔍 Troubleshooting

### Mixed Content Issues (HTTPS Frontend)

**Symptoms:**
- "Mixed content" errors in console
- Payment submissions fail
- "saved locally due to connection problem" message

**Solutions:**
1. **Host frontend on HTTP** (easiest)
2. **Upgrade PocketBase to HTTPS**:
   - Get SSL certificate for your NodeLumes domain
   - Configure PocketBase with HTTPS
   - Update `config.js` with HTTPS URL

### CORS Issues

**Symptoms:**
- "CORS policy" errors in console
- Network requests blocked

**Solutions:**
1. **Configure PocketBase CORS settings**:
   - Access PocketBase admin panel
   - Go to Settings → Application
   - Add your frontend domain to allowed origins
   - Example: `https://yoursite.netlify.app`

### Connection Timeouts

**Symptoms:**
- Requests take too long
- "Network error" messages

**Solutions:**
1. **Check NodeLumes server status**
2. **Verify PocketBase is running**
3. **Test direct access**: `http://node68.lunes.host:3246/api/health`

## 📊 Environment Detection

The application automatically detects:

| Environment | Protocol | Expected Behavior |
|-------------|----------|-------------------|
| Localhost | HTTP | ✅ Full functionality |
| Localhost | HTTPS | ⚠️ Mixed content warnings |
| Production | HTTP | ✅ Should work perfectly |
| Production | HTTPS | ⚠️ May require additional setup |

## 🛠️ Advanced Configuration

### Custom PocketBase URL

To use a different PocketBase server, edit `config.js`:

```javascript
window.EliteCardsConfig = {
    pocketbase: {
        url: 'https://your-custom-pocketbase.com',  // Your URL here
        // ... rest of config
    }
};
```

### Debug Mode

Enable verbose logging by opening browser console and running:
```javascript
window.EliteCardsConfig.errorHandling.verboseLogging = true;
```

## 📞 Support

If you encounter issues:

1. **Check browser console** for detailed error messages
2. **Verify PocketBase server** is accessible
3. **Test with HTTP hosting** first
4. **Check CORS configuration** in PocketBase admin

## 🎯 Recommended Hosting Services

### For HTTP Hosting:
- **Surge.sh** - Simple HTTP hosting
- **Firebase Hosting** - With HTTP configuration
- **Custom VPS** - Full control

### For HTTPS Hosting:
- **Netlify** - Popular choice
- **Vercel** - Great for modern apps
- **GitHub Pages** - Free option

**Note**: When using HTTPS hosting, ensure your PocketBase server also supports HTTPS for full compatibility.