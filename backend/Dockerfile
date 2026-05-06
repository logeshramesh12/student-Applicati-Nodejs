# Use modern Node (fix future AWS SDK warning)
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3500

# Environment
ENV NODE_ENV=production

# Start app
CMD ["node", "server.js"]