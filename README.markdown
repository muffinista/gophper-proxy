# gophper-proxy

gophper-proxy is a simple web proxy for gopher servers. It should run
on any modernish PHP server, and most of the processing is actually done in
javascript for maximum portability.

## Features
* It runs on PHP using [Slim][slim], which is a nifty lightweight application framework.
* It's built on Zurb Foundation, a great HTML framework.
* It caches requests for faster response times.
* All of the rendering happens in the browser, which means someone could easily write a different backend.
* If the user accesses a binary file, they can download it. If they click on an image, they can see it in the browser.
* It can be integrated with Google Analytics, and it also has it's own
internal stats.
* You can restrict it to a single gopher server, so you can integrate
it into your project without any fears of someone using your proxy for
naughty tricks.

## Installing
* Copy the code to your web tree
* Copy config.php.example to config.php, and double-check the
variables for anything you might need to set. In particular, you need
to create a cache directory and make sure it is writable.

TODO
====
* better docs
* clean up the js

Contributing
------------

Fixes and contributions are happily accepted. Please fork the code and
submit a pull request.


Copyright/License
-----------------

Copyright (c) 2013 Colin Mitchell. Chatterbot is distributed under a
modified WTFPL licence -- it's the 'Do what the fuck you want to --
but don't be an asshole' public license. Please see LICENSE.txt for
further details. Basically, do whatever you want with this code, but
don't be an asshole about it. If you are an asshole, expect your karma
to suffer.


http://muffinlabs.com



