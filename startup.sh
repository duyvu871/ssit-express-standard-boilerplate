#!/bin/sh -ex

# Run database migrations
echo "Running database migrations..."
# npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push --skip-generate

# Start the application
echo "Starting application..."
exec npm start