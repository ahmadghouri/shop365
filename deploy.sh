#!/bin/bash

# Kisi bhi error par script ko rokne ke liye
set -e

echo "🚀 Deployment start ho rahi hai..."

# 1. Git se latest code pull karein (agar git use kar rahe hain)
# git pull origin main

# 2. Backend update aur PM2 restart
echo "📦 Backend ko update aur restart kiya ja raha hai..."
cd /var/www/shop365/Backend-Node   # Apna backend folder path yahan likhein
npm install
pm2 restart shoptest

# 3. Frontend build karein
echo "🎨 Frontend build kiya ja raha hai..."
cd /var/www/shop365/Frontend   # Apna frontend folder path yahan likhein
npm install --legacy-peer-deps
npm run build

# 4. Nginx test aur reload
echo "🌐 Nginx reload kiya ja raha hai..."
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Mubarak ho! Deployment kamyabi ke sath mukammal ho gayi hai."