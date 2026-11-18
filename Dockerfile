FROM php:8.2-apache

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Instalar extensión MongoDB para PHP
RUN pecl install mongodb-2.5.7 \
    && docker-php-ext-enable mongodb

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar primero archivos de Composer
COPY composer.json composer.lock ./

# Instalar dependencias PHP
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Copiar proyecto
COPY . .

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]