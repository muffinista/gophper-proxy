class GopherParser {
  /**
  * regex for matching gopher entries. borrowed from:
  * https://github.com/twhaples/gopher-client/blob/master/lib/parser.js
  * because it does a better job than the pattern I originally borrowed from phpjs
  */
  entryPattern = /^(\S)([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)/;
  
  /**
  * the different sorts of gopher entries we will handle. each entry here is a
  * hash with the following keys:
  *
  * style - general style of the entry -- information, error, link, etc.
  * link - true/false, should we link to the selector for this entry?
  * icon - an icon class to render with this file. these icons are from
  *   the Twitter Bootstrap library
  */
  entryTypes = {
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
  }
  
  /**
  * determine if we should render the string as a gopher menu or not
  * @param d data to test
  * @return true if we should parse as gopher menu, false otherwise
  */
  shouldRender = function(d) {
    var data = d.split("\n");
    return data[0].match(this.entryPattern) !== null;
  }
  
  /**
  * parse the incoming data as a gopher menu
  * @param data text to parse
  * @return array of objects which represent the data of the menu
  */
  parseGopher = function(data) {
    var lines = [];
    data = data.split("\n");
    for ( var i = 0; i < data.length; i++ ) {
      if ( data[i] != "." ) {
        lines.push(this.parseEntry(data[i]));
      }
    }
    
    return lines;
  }
  
  
  /**
  * given an item type, return the EntryType used to represent it.
  * @param entry type as specified in RFC 1436 section 3.8
  * @return entry type object
  */
  getType = function(t) {
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
  }
  
  /**
  * parse a line from a gopher menu
  * borrowed and modified from phpjs:
  * @see http://phpjs.org/functions/gopher_parsedir:833
  *
  * @param dirent the line to parse
  * @return object
  */
  parseEntry = function(dirent) {
    var entry = dirent.match(this.entryPattern);
    
    // parse error
    if (entry === null) {
      return {}
    }
    
    return {
      type: this.getType(entry[1]),
      title: entry[2],
      path: entry[3],
      host: entry[4],
      port: entry[5]
    }
    
  }
  
  /**
  * take a gopher menu entry, and turn it into an href path which can be used to request the selector via the proxy.
  *
  * the html style link for this entry will be /HOST(:PORT)/SELECTOR
  *
  * @return a href that will request this menu entry via the proxy
  */
  entryToLink = function(e) {
    var href = "/" + e.host;
    
    if ( e.type == this.entryTypes.html ) {
      return e.path.replace("URL:", "");
    }
    
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
  }
} 
  
addEventListener('load', (event) => {
  const parser = new GopherParser();
  let data, entries;
  const el = document.querySelector('#gopher');
  data = el.textContent;

  // make sure we should render -- if this doesn't look like gophertext,
  // we'll just spit back the text itself
  if ( ! parser.shouldRender(data) ) {
    console.log("looks like this didn't pan out");
    el.innerHTML = data;
    return;
  }

  entries = parser.parseGopher(data);

  const template = document.querySelector('#row-link-template');
  const textTemplate = document.querySelector('#row-text-template');
  const formTemplate = document.querySelector('#row-form-template');

  el.innerHTML = "";
  
  entries.filter((e) => e.type).forEach((e) => {
    
    var text = e.title;
    var type = e.type;
    
    let row;

    if ( type.link === false ) {
      row = textTemplate.content.firstElementChild.cloneNode(true);
    }
    else if ( typeof(type.form) !== "undefined" && type.form === true ) {
      row = formTemplate.content.firstElementChild.cloneNode(true);
    }
    else {
      row = template.content.firstElementChild.cloneNode(true);
    }

    // if we have an icon class, add it here
    if ( type.icon ) {
      row.querySelector('i.icon').classList.add(type.icon);
    }
    
    //
    // generate a form for search entries
    //
    if ( typeof(type.form) !== "undefined" && type.form === true ) {
      const href = parser.entryToLink(e);
      row.querySelector('form').action = href;
    }
    
    // if there was no path, don't output a URL
    else if ( type.link === false ) {
      row.querySelector('span').innerHTML = text;
    }
    
    // output a link
    else {
      const href = parser.entryToLink(e);

      row.querySelector('a').href = href;
      row.querySelector('a').innerHTML = text;

    }
    el.appendChild(row);
  });
});
