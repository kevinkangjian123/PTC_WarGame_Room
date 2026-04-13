# Use full Node image for building native modules
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM node:20-slim

# Install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
# We use --include=dev temporarily if we need tsx, or just keep tsx in dependencies
RUN npm install --omit=dev

# Copy build artifacts and all source code needed for tsx
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create necessary directories
RUN mkdir -p uploads && chmod 777 uploads

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
# Optimize Node memory usage for small containers
ENV NODE_OPTIONS="--max-old-space-size=450"

# Start the server using the locally installed tsx
CMD ["npx", "tsx", "server.ts"]
