# ---------------------------
# Base image
# ---------------------------
FROM node:18-alpine

# ---------------------------
# Set working directory
# ---------------------------
WORKDIR /app

# ---------------------------
# Copy package files first (for caching)
# ---------------------------
COPY package*.json ./

# ---------------------------
# Install production dependencies only
# ---------------------------
#RUN npm ci --only=production

# ---------------------------
# Copy application source
# ---------------------------
COPY . .

# ---------------------------
# Create non-root user (security best practice)
# ---------------------------
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

# ---------------------------
# Expose backend port
# ---------------------------
EXPOSE 3500

# ---------------------------
# Environment
# ---------------------------
#ENV NODE_ENV=production

# ---------------------------
# Start application
# ---------------------------
CMD ["node", "server.js"]