#!/bin/bash

# Deploy to GitHub Pages script
echo "🚀 Deploying to GitHub Pages..."

# Set environment variable and build
echo "📦 Building with GitHub Pages configuration..."
export GITHUB_PAGES=true
npm run build:ghpages

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo "📤 Deploying to gh-pages branch..."

# Deploy using gh-pages
npx gh-pages -d dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app will be available at: https://tw092669-ctrl.github.io/InvoiceSnap/"
    echo "⏳ It may take a few minutes for changes to appear."
else
    echo "❌ Deployment failed!"
    exit 1
fi
