FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN apt-get update && \
    apt-get install -y git unzip libzip-dev zlib1g-dev mariadb-client libssl-dev --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* **  &&\
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer && \
    docker-php-ext-install pdo_mysql mysqli zip && \
    a2enmod rewrite

WORKDIR /var/www/html
COPY ./ /var/www/html/

RUN mkdir -p /var/www/html/var/log && chmod -R 777 /var/www/html/var/

#COPY php-debugging.ini $PHP_INI_DIR/conf.d/

#RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

RUN COMPOSER_ALLOW_SUPERUSER=1 /bin/composer install --prefer-source --no-interaction
