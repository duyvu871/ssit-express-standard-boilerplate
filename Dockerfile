FROM node:lts-alpine
ENV TZ=Asia/Ho_Chi_Minh
# Install build dependencies and timezone data
RUN apk add --no-cache python3 make g++ gcc tzdata && \
    cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    echo "Asia/Ho_Chi_Minh" > /etc/timezone

# Create App Directory
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma

# Install Node.js dependencies and build native modules
RUN npm ci --build-from-source --verbose --progress && \
    npm rebuild bcrypt --build-from-source --verbose

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