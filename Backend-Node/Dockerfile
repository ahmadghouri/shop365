# ---- Backend-Node ke liye simple Docker image ----
# Ye file batati hai ke app ko ek container mein kaise chalana hai.

# 1) Base image: Node.js (LTS) ka chhota version.
FROM node:20-alpine

# 2) Container ke andar kaam karne ki jagah (folder).
WORKDIR /app

# 3) Pehle sirf package files copy karo (taake npm install ki caching kaam kare).
COPY package*.json ./

# 4) Sirf production dependencies install karo (dev tools jaise nodemon skip).
RUN npm install --omit=dev

# 5) Baaki saara source code copy karo.
COPY . .

# 6) App is port par chalta hai (aap .env mein PORT badal sakte ho).
EXPOSE 8000

# 7) Production mode.
ENV NODE_ENV=production

# 8) App start karne ka command (nodemon nahi, plain node — production ke liye).
CMD ["node", "src/server.js"]
