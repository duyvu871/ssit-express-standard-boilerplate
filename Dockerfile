FROM node:lts-alpine

# Create App Directory
WORKDIR /usr/src/app

# Copy package.json and tsconfig.json
COPY package*.json ./
COPY tsconfig*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy source files
COPY . .

# Expose the port
EXPOSE 8000

# Build the application
RUN npm run build

# Set the command to run your app
CMD ["npm", "run", "start"]