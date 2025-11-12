# Stage 1: Build dependencies
FROM php:8.2-fpm AS vendor

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git curl \
    && docker-php-ext-install pdo pdo_pgsql bcmath sockets \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copy the entire application first (so artisan exists)
COPY . .

# Now install PHP dependencies (artisan is present)
RUN composer install --no-dev --optimize-autoloader

# Stage 2: Application runtime
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git curl \
    && docker-php-ext-install pdo pdo_pgsql bcmath sockets \
    && pecl install redis \
    && docker-php-ext-enable redis

WORKDIR /app

# Copy everything from vendor stage
COPY --from=vendor /app /app

CMD ["php-fpm"]
