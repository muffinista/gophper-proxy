function GopherParser() {}

/**
 *  regex for matching gopher entries. borrowed and modified from phpjs
 */
GopherParser.prototype.entryPattern = /^(.)(.*?)\t(.*?)\t(.*?)\t(\d+).*/;

/**
 * the different sorts of gopher entries we will handle. each entry here is a
 * hash with the following keys:
 *
 * style - general style of the entry -- information, error, link, etc.
 * link - true/false, should we link to the selector for this entry?
 * icon - an icon class to render with this file. these icons are from
 *   the Twitter Bootstrap library
 */
GopherParser.prototype.entryTypes = {
  info: { link : false },
  error: { link : false, icon : 'icon-exclamation-sign' },
  directory: { link : true, icon : 'icon-folder-open' },
  document: { link : true, icon : 'icon-file' },
  binhex: { link : true, icon : 'icon-download-alt' },
  dosbinary: { link : true, icon : 'icon-download-alt' },
  uuencoded: { link : true, icon : 'icon-download-alt' },
  binary: { link : true, icon : 'icon-download-alt' },
  html: { link : true, icon : 'icon-bookmark' },
  search: { link : true, form: true, icon : 'icon-search' },
  image: { link : true, icon : 'icon-picture' },
  audio: { link : true, icon : 'icon-music' },
  unknown: { link : true, icon : 'icon-question-sign' }
};


/**
 * determine if we should render the string as a gopher menu or not
 * @param d data to test
 * @return true if we should parse as gopher menu, false otherwise
 */
GopherParser.prototype.shouldRender = function(d) {
  var data = d.split("\n");
  return data[0].match(this.entryPattern) !== null;
};

/**
 * parse the incoming data as a gopher menu
 * @param data text to parse
 * @return array of objects which represent the data of the menu
 */
GopherParser.prototype.parseGopher = function(data) {
  var lines = [];
  data = data.split("\n");
  for ( var i = 0; i < data.length; i++ ) {
    if ( data[i] != "." ) {
      lines.push(this.parseEntry(data[i]));
    }
  }

  return lines;
};


/**
 * given an item type, return the EntryType used to represent it.
 * @param entry type as specified in RFC 1436 section 3.8
 * @return entry type object
 */
GopherParser.prototype.getType = function(t) {
  switch (t) {
  case 'i':
    return this.entryTypes.info;
  case '3':
    return this.entryTypes.error;
  case '1':
    return this.entryTypes.directory;
  case '0':
    return this.entryTypes.document;
  case '4':
    return this.entryTypes.binhex;
  case '5':
    return this.entryTypes.dosbinary;
  case '6':
    return this.entryTypes.uuencoded;
  case '7':
    return this.entryTypes.search;
  case '9':
    return this.entryTypes.binary;
  case 'h':
    return this.entryTypes.html;
  case 'd':
    return this.entryTypes.image;
  case 's':
    return this.entryTypes.audio;
  default:
    return this.entryTypes.unknown;
  }
};

/**
 * parse a line from a gopher menu
 * borrowed and modified from phpjs:
 * @see http://phpjs.org/functions/gopher_parsedir:833
 *
 * @param dirent the line to parse
 * @return object
 */
GopherParser.prototype.parseEntry = function(dirent) {
  var entry = dirent.match(this.entryPattern);

  // parse error
  if (entry === null) {
    return {};
  }

  return {
    type: this.getType(entry[1]),
    title: entry[2],
    path: entry[3],
    host: entry[4],
    port: entry[5]
  };

};

/**
 * take a gopher menu entry, and turn it into an href path which can be used to request the selector via the proxy.
 *
 * the html style link for this entry will be /HOST(:PORT)/SELECTOR
 *
 * @return a href that will request this menu entry via the proxy
 */
GopherParser.prototype.entryToLink = function(e) {
  var href = "/" + e.host;

  // add the port if needed
  if ( e.port != 70 ) {
    href = href + ":" + e.port;
  }

  // clean up the path a bit, make sure there's always a slash
  if ( e.path && e.path[0] != "/" ) {
    e.path = "/" + e.path;
  }


  href = href + e.path;

  return href;
};

(function( $ ){
  /**
   * convert newlines to breaks
   * @see http://phpjs.org/functions/nl2br:480
   */
  function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  }

  /**
   * parse some gophertext and render some pretty HTML from it.
   *
   * d - data to parse. if this isn't specified, parse the contents of the target element
   */
  $.fn.fromGopher = function(d) {
    var data, entries;
    var parser = new GopherParser();

    // if we didn't get any incoming data, use the content of our target
    if ( typeof(d) === "undefined" ) {
      data = $(this).html().trim();
    }
    else {
      data = d;
    }

    // make sure we should render -- if this doesn't look like gophertext,
    // we'll just spit back the text itself
    if ( ! parser.shouldRender(data) ) {
      // if we're specifying preformatted text via CSS, then
      // don't add any newlines to the output
      if ( $(this).css("white-space") == "pre" || $(this).css("white-space") == "pre-wrap" ) {
        $(this).html(data);
      }
      else {
        $(this).html(nl2br(data));
      }
    }
    else {
      entries = parser.parseGopher(data);

      // reset the container
      $(this).html("");

      for ( var i = 0; i < entries.length; i++ ) {
        var e = entries[i];

        // don't freak out if there's no valid type, just skip the line
        if ( ! e.type ) {
          continue;
        }

        var href = parser.entryToLink(e);
        var text = e.title;
        var type = e.type;

        var result;
        var icon = "";


        //
        // generate a form for search entries
        //
        if ( typeof(type.form) !== "undefined" && type.form === true ) {
            result = $("<form />").
                attr("method", "post").
                attr("action", href).
                addClass("form-inline");

            var button = $("<button />").attr("type", "submit").addClass("btn").html("Go!");
            $(result).
                append("<input name='text' class='span3' placeholder='input' />").
                append(button);
            
        }

        // if there was no path, don't output a URL
        else if ( type.link === false ) {
            result = text;
        }

        // output a link
        else {
          result = $("<a />").
            attr("href", href).
            html(text);
        }

        // if we have an icon class, add it here
        if ( type.icon ) {
          icon = $("<i />").addClass(type.icon).append("&nbsp;");
        }

        // add the output!
        $(this).append(icon).append(result).append("<br />");
      }
    }
    return $(this);
  };
})( jQuery );
