#!/bin/bash -ex

NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Copy config files
sudo cp nginx/sites-available/*.conf $NGINX_AVAILABLE/

# Tạo symlink
for file in nginx/sites-available/*.conf; do
    filename=$(basename "$file")
    sudo ln -sf $NGINX_AVAILABLE/$filename $NGINX_ENABLED/$filename
done

# Kiểm tra config & reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configuration updated successfully!"
