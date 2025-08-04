# Image Requirements for Elite Cards

## 📁 Image Directory Structure

All card images should be placed in the `images/` directory with the following naming convention:

```
images/
├── default-card.png          # Fallback image for missing cards
├── american-express.png      # American Express card image
├── mastercard-platinum.png   # Mastercard Platinum card image
├── titanium-discover.png     # Titanium Discover card image
├── visa-gold.png            # Visa Gold card image
└── visa-infinite.png        # Visa Infinite card image
```

## 🎯 Required Image Files

The application expects these specific image files:

1. **american-express.png** - American Express card
2. **mastercard-platinum.png** - Mastercard Platinum card
3. **titanium-discover.png** - Titanium Discover card
4. **visa-gold.png** - Visa Gold card
5. **visa-infinite.png** - Visa Infinite card
6. **default-card.png** - Default fallback image (already created)

## 📐 Image Specifications

### Recommended Dimensions:
- **Width**: 400px - 600px
- **Height**: 250px - 375px
- **Aspect Ratio**: 16:10 or 3:2 (credit card proportions)
- **Format**: PNG (preferred) or JPG
- **File Size**: Under 500KB per image for optimal loading

### Image Quality Guidelines:
- High resolution for crisp display
- Transparent background (PNG) or clean background
- Professional card design appearance
- Consistent styling across all cards

## 🔧 Code Changes Made

### 1. Cleaned Script.js
- Removed hardcoded image mappings
- Simplified image source logic
- Now uses product.image directly or falls back to default

### 2. Updated Database (db.js)
- Standardized image file names with hyphens
- Changed from .svg to .png format
- Consistent naming convention across all products

### 3. Created Images Directory
- Created `/images/` folder
- Added default placeholder image

## 🚀 Next Steps

1. **Add your new image files** to the `images/` directory
2. **Name them exactly** as specified above
3. **Test the application** to ensure images load correctly
4. **Replace default-card.png** if you have a custom fallback image

## 💡 Notes

- The application will automatically use your new images once they're placed in the correct location
- If an image is missing, it will fall back to `default-card.png`
- All image paths are relative to the project root
- The exchange rate is already fixed at $1 = GHC 10.38

## 🔍 Testing

After adding your images, you can test by:
1. Opening the application in a browser
2. Logging in with test credentials (john@example.com / password123)
3. Navigating to the Cards page
4. Verifying all card images display correctly

---

**Ready for your new image files!** 🎨