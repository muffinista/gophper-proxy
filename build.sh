#!/bin/bash

cat assets/js/jquery.colorbox.js assets/js/gopher.js assets/js/site.js| java -jar ~/bin/yuicompressor-2.4.7.jar --type js > assets/js/compressed.js
cat assets/css/bootstrap.min.css assets/css/bootstrap-responsive.min.css assets/css/colorbox.css assets/css/gophper.css | java -jar ~/bin/yuicompressor-2.4.7.jar --type css > assets/css/assets.css
