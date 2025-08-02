#!/bin/bash

# PocketBase Setup Script for Elite Cards
# This script downloads and sets up PocketBase locally for development and testing

echo "🚀 Setting up PocketBase for Elite Cards..."

# Create pocketbase directory
mkdir -p pocketbase
cd pocketbase

# Download PocketBase (Linux AMD64)
echo "📥 Downloading PocketBase..."
wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Extract PocketBase
echo "📦 Extracting PocketBase..."
unzip pocketbase.zip
chmod +x pocketbase

# Clean up
rm pocketbase.zip

echo "✅ PocketBase downloaded successfully!"
echo ""
echo "🔧 To start PocketBase:"
echo "   cd pocketbase"
echo "   ./pocketbase serve --http=0.0.0.0:8090"
echo ""
echo "🌐 PocketBase will be available at:"
echo "   - Local: http://localhost:8090"
echo "   - Admin: http://localhost:8090/_/"
echo ""
echo "📋 Next steps:"
echo "   1. Start PocketBase with the command above"
echo "   2. Open the admin interface and create collections"
echo "   3. Update the frontend configuration to use local PocketBase"