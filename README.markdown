# Gophper: A Gopher Proxy for Modern Times #

The [Gopher](http://en.wikipedia.org/wiki/Gopher_(protocol))
protocol was published in 1991. It was popular for some
time, but died off in the late 1990s, partially because of some
poor decisions by the University of Minnesota (which owned
the licensing rights), and also because HTTP and HTML was
undoubtedly a better system for what became the World Wide Web.

There are still gopher servers out there today, but most
browsers can't visit them anymore, because support for the
Gopher protocol has been removed. There are a couple of
proxy servers out there, but they all suck, and none of them
are open-source, so I wrote Gophper, a very simple proxy
server with a small PHP backend, and a parser written in
Javascript.

## About Gophper ##

Gophper has a bunch of cool features:

* The backend is written in PHP using the Slim framework. It is very
  simple and easy to modify.
* The bulk of the work is done in Javascript, so you can very easily
  re-implement with a different backend if desired.
* Uses the Twitter Bootstrap framework for output -- it's visually
  appealing, generates nice code, and should be easy to tweak if
  needed.
* It caches gopher pages for fast performance.
* Displays images in modal windows
* Detects when a user has requested a binary file (Image, Document,
  etc) and returns that file to the browser, rather than returning junk
  and crashing your browser like most gopher proxies.
* Report traffic to GA, and also track stats locally to present reports to users.
* Restrict the proxy to a single host or port if desired. That way you
  can use it as the web frontend to your nifty gopher project.

## Using Gophper ##

Using Gophper is easy:
* drop the code wherever you want it
* copy config.php.example to config.php, and update any values inside
  if needed
* If you want to track traffic in the database, run stats.sql, and
  make sure that you've set the right login credentials in the config
  file.
* Update templates/intro.html if you want, to point to your Gopher
  server, etc. Right now, it has a description of gophper-proxy and
  links to some popular gopher sites.

## Bugs/Troubleshooting ##

If you have a problem, feel free to submit a support request on Github.

## TODO ##

* Make it possible to run in a subdirectory

## Copyright/License ##

Copyright (c) 2012 Colin Mitchell. Licensed under WTFPL
licence. Please see LICENSE.txt for further details.

http://muffinlabs.com
