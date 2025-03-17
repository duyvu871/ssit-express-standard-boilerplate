#!/bin/sh

# Run database migrations
echo "Running database migrations..."
npx prisma migrate dev
# npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec npm start