FROM node:lts-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc

# Create App Directory
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma

# Install Node.js dependencies and build native modules
RUN npm ci --build-from-source && \
    npm rebuild bcrypt --build-from-source

# Copy source files
COPY . .

# Expose the port
EXPOSE 8000

# Build the application
RUN mv .env.production .env && \
    mv .env.local .env.local
RUN npm run build

# Run database migrations


# Ensure bcrypt native module is available
RUN mkdir -p dist/lib/binding/napi-v3 && \
    cp -r node_modules/bcrypt/lib/binding/* dist/lib/binding/

# Start the application
RUN chmod +x ./startup.sh
CMD ["./startup.sh"]