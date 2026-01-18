#!/bin/bash
set -e

# Install Composer dependencies
composer install --no-interaction --optimize-autoloader

# Set permissions
chmod -R 755 upload
chmod -R 777 upload/system/storage

echo "Build completed successfully"

