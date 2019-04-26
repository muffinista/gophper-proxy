# gophper-proxy

gophper-proxy is a simple web proxy for gopher servers. It should run
on any modernish PHP server, and most of the processing is actually
done in javascript for maximum portability. There's also a docker
setup which can run anywhere that docker works.

## Features
* It runs on PHP using [Slim][slim], which is a nifty lightweight application framework.
* It's built on Zurb Foundation
* It caches requests for faster response times.
* All of the rendering happens in the browser, which means someone could easily write a different backend.
* If the user accesses a binary file, they can download it. If they click on an image, they can see it in the browser.
* You can restrict it to a single gopher server, so you can integrate
it into your project without any fears of someone using your proxy for
naughty tricks.

## Installing
* Copy the code to your web tree
* Copy config.php.example to config.php, and double-check the
variables for anything you might need to set. In particular, you need
to create a cache directory and make sure it is writable.

Contributing
------------

Fixes and contributions are happily accepted. Please fork the code and
submit a pull request.


Copyright/License
-----------------


http://muffinlabs.com



