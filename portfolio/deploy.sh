#!/bin/bash
# Deployment script for GitHub Pages with custom domain

# Navigate to the portfolio directory
cd "$(dirname "$0")"

# Install dependencies
npm install

# Build the project
npm run build

# Copy CNAME to build directory to preserve custom domain
cp ../CNAME build/CNAME

# Deploy to GitHub Pages
npm run deploy
