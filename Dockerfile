
FROM php:8.2-apache

# Instalar dependencias del sistema y extensiones PHP
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install curl zip \
    && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Instalar extensión MongoDB para PHP
RUN pecl install mongodb-2.5.7 \
    && docker-php-ext-enable mongodb

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar archivos de Composer
COPY composer.json composer.lock ./

# Comprobar extensiones antes de instalar dependencias
RUN php -m | grep -i zip && command -v unzip

# Instalar dependencias PHP
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Copiar el proyecto
COPY . .

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
