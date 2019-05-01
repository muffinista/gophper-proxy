# gophper-proxy

gophper-proxy is a simple web proxy for gopher servers. It should run
on any modernish PHP server, and most of the processing is actually
done in javascript for maximum portability. There's also a docker
setup which can run anywhere that docker works.

## Features
* It runs on PHP using [Slim][slim], which is a nifty lightweight
  application framework.
* It caches requests for faster response times.
* All of the rendering happens in the browser, which means someone
  could easily write a different backend.
* If the user accesses a binary file, they can download it. If they
  click on an image, they can see it in the browser.
* You can restrict it to a single gopher server, so you can integrate
  it into your project without any fears of someone using your proxy for
  naughty tricks.

## Using Docker

The docker image is built from a PHP/apache image, so running it is
pretty simple. Something like this should work:

```
docker build -t gophper-proxy .
docker run -it --rm --name my-running-app gophper-proxy
```

There are a few environment variables you can use to configure the proxy:

* `GOPHER_TITLE`: The title which will be used when outputting pages
* `START_REQUEST`: An initial server to load requests from. If not
  specified, a stock intro page is used. Example: `gopherpedia.com:70`
* `RESTRICT_TO_MATCH`: A filter to restrict which pages can be
  served. For example, to restrict to a single server you could use
  something like `/gopherpedia.com/`
* `ALLOW_ALL_PORTS`: `true` or `false`. Should the proxy allow ports
  other than 70? Setting this to true is a security risk.

Here's a sample `docker-compose.yml' file if that's helpful for you:

```
version: "3.5"

services:
  web:
    image: muffinista/gopher-proxy
    networks:
      - external_network
    env_file: .env
    environment:
      docker: "true"
      production: "false"
    volumes:
      - .:/var/www/html #:cached
      - ./logs:/var/www/logs:cached
    ports:
      - 80:80
networks:
  external_network:
```

## Running Natively

* Copy the code to your web tree
* Set any environment variables that are needed (see above)
* Copy config.php.example to config.php, and double-check the
variables for anything you might need to set. In particular, you need
to create a cache directory and make sure it is writable.

Contributing
------------

Fixes and contributions are happily accepted. Please fork the code and
submit a pull request.


Copyright/License
-----------------

See LICENSE.txt

http://muffinlabs.com



