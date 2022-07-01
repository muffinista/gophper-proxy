FROM php:8.0-apache

RUN apt-get update && \
    apt-get install -y git unzip libzip-dev zlib1g-dev mariadb-client libssl-dev --no-install-recommends \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && docker-php-ext-install pdo_mysql mysqli zip \
    && a2enmod rewrite

WORKDIR /var/www/html
COPY ./ /var/www/html/

COPY .htaccess /var/www/html/

#COPY php-debugging.ini $PHP_INI_DIR/conf.d/

#RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

RUN composer install --prefer-source --no-interaction
