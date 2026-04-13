# Use full Node image for building native modules
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend and server
RUN echo "Starting frontend build..." && npm run build
RUN echo "Starting server build..." && npm run build:server
RUN echo "Build process completed."

# Production image
FROM node:20-slim

# Install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p uploads && chmod 777 uploads

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=450"

# Start the server using the compiled JS file
CMD ["node", "dist/server.js"]
