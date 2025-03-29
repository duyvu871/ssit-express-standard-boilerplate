#!/bin/sh -ex

# Check timezone configuration
echo "Checking timezone configuration..."
if [ ! -f /etc/timezone ] || [ ! -f /etc/localtime ]; then
    echo "Timezone files missing, setting up timezone..."
    cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime
    echo "Asia/Ho_Chi_Minh" > /etc/timezone
fi

# Run database migrations
echo "Running database migrations..."
# npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push --skip-generate

# Start the application
echo "Starting application..."
exec npm start