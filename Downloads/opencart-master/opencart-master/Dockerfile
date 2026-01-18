FROM php:8.2-apache

# Install required PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd mysqli pdo_mysql zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files (composer.lock is optional and may not exist)
COPY composer.json ./

# Install PHP dependencies (works with or without composer.lock)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Copy application files
COPY . .

# Create empty config.php files (required for OpenCart installation)
# Files must be empty (0 bytes) so the installer doesn't try to read DB constants
RUN touch /var/www/html/upload/config.php \
    && touch /var/www/html/upload/admin/config.php

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/upload/system/storage \
    && chmod 777 /var/www/html/upload/config.php \
    && chmod 777 /var/www/html/upload/admin/config.php

# Configure Apache
RUN a2enmod rewrite

# Configure Apache to use Render's PORT environment variable (defaults to 10000)
ENV PORT=10000
RUN sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf

# Ensure upload directory exists and has proper permissions
RUN mkdir -p /var/www/html/upload

# Copy Apache virtual host configuration (AFTER mkdir to avoid sed issues)
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# Set document root environment variable (for reference only)
ENV APACHE_DOCUMENT_ROOT=/var/www/html/upload

# Port is exposed via PORT environment variable

# Start Apache
CMD apache2-foreground
