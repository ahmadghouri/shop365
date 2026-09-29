# ---- Frontend (Vue + Vite) ke liye simple Docker image ----
# nginx ke bina: build karke usi ko Node ke "vite preview" se serve karte hain.

FROM node:20-alpine

WORKDIR /app

# Pehle package files (npm install ki caching ke liye).
# --legacy-peer-deps: is project mein vite@7 aur @vitejs/plugin-vue ke beech
# peer-dependency ka mismatch hai; ye flag usko allow kar deta hai (jaise local
# install mein hota hai).
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Baaki code copy karo.
COPY . .

# App build karo (build script khud "cp web.env .env" karke vite build chalata hai).
# Output ./cordova-app/www mein jata hai (vite.config.js ke mutabiq).
RUN npm run build

# vite preview is port par serve karta hai.
EXPOSE 4173

# Built app ko serve karo. --host taake container ke bahar se access ho.
# outDir vite.config.js se aa jata hai (./cordova-app/www).
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
