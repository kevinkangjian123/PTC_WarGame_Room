# Use Node.js 20 as the base image
FROM node:20-slim AS builder

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

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

# Install tsx to run the server
RUN npm install -g tsx

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["tsx", "server.ts"]
