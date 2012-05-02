function GopherParser() {};

/**
 *  regex for matching gopher entries. it didn't quite work in its original form (see below)
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
	info: { style: 'info', link : false },
	error: { style: 'error', link : false, icon : 'icon-exclamation-sign' },
	directory: { style: 'info', link : true, icon : 'icon-folder-open' },
	document: { style: 'document', link : true, icon : 'icon-file' },
	binhex: { style: 'file', link : true, icon : 'icon-download-alt' },
	dosbinary: { style: 'file', link : true, icon : 'icon-download-alt' },
	uuencoded: { style: 'file', link : true, icon : 'icon-download-alt' },
	binary: { style: 'file', link : true, icon : 'icon-download-alt' },
	html: { style: 'html', link : true, icon : 'icon-bookmark' },
	search: { style: 'search', link : true, form: true, icon : 'icon-search' },
	image: { style: 'image', link : true, icon : 'icon-picture' },
	audio: { style: 'audio', link : true, icon : 'icon-music' },
	unknown: { style: 'unknown', link : true, icon : 'icon-question-sign' }
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
		break;
	case '3':
		return this.entryTypes.error;
		break;
	case '1':
		return this.entryTypes.directory;
		break;
	case '0':
		return this.entryTypes.document;
		break;
	case '4':
		return this.entryTypes.binhex;
		break;
	case '5':
		return this.entryTypes.dosbinary;
		break;
	case '6':
		return this.entryTypes.uuencoded;
		break;
	case '7':
		return this.entryTypes.search;
		break;
	case '9':
		return this.entryTypes.binary;
		break;
	case 'h':
		return this.entryTypes.html;
		break;
	case 'd':
		return this.entryTypes.image;
		break;
	case 's':
		return this.entryTypes.audio;
		break;
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
	//var entryPattern = /^(.)(.*?)\t(.*?)\t(.*?)\t(.*?)\u000d\u000a$/;
	// http://kevin.vanzonneveld.net
	// +   original by: Brett Zamir (http://brett-zamir.me)
	// *     example 1: var entry = gopher_parsedir('0All about my gopher site.\t/allabout.txt\tgopher.example.com\t70\u000d\u000a');
	// *     example 1: entry.title;
	// *     returns 1: 'All about my gopher site.'

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

(function( $ ){

	/**
	 * convert newlines to breaks
	 */
	function nl2br (str, is_xhtml) {
		// http://kevin.vanzonneveld.net
		// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   improved by: Philip Peterson
		// +   improved by: Onno Marsman
		// +   improved by: Atli Þór
		// +   bugfixed by: Onno Marsman
		// +      input by: Brett Zamir (http://brett-zamir.me)
		// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// +   improved by: Maximusya
		// *     example 1: nl2br('Kevin\nvan\nZonneveld');
		// *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
		// *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
		// *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
		// *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
		// *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
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

		if ( typeof(d) === "undefined" ) {
			data = $(this).html().trim();
		}
		else {
			data = d;
		}

		// make sure we should render -- if this doesn't look like gophertext,
		// we'll just spit back the text itself
		if ( ! parser.shouldRender(data) ) {
//			$(this).html(nl2br(data));
			$(this).html(data);
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

				// clean up the path a bit
				if ( e.path && e.path[0] != "/" ) {
					e.path = "/" + e.path;
				}

				// the html style link for this entry will be /HOST/SELECTOR
				var href = "/" + e.host;

				if ( e.port != 70 ) {
					href = href + ":" + e.port;
				}

				href = href + e.path;

				var text = e.title;
				var type = e.type;

				var result;
				var icon = "";

				// if we have an icon class, add it here
				if ( type.icon ) {
					icon = $("<i />").addClass(type.icon).append("&nbsp;");
				}

				//
				// generate a form for search entries
				//
				if ( typeof(type.form) !== "undefined" && type.form == true ) {

					// handle search input

					result = $("<form method='post' />").
						attr("action", href).
						addClass("gopher-" + type.style).
						addClass("form-inline");

					var button = $("<button />").attr("type", "submit").addClass("btn").html("Go!");
					$(result).
						append("<input name='text' class='span3' placeholder='input' />").
						append(button);

				}

				// if there was no path, don't output a URL
				else if ( type.link == false ) {
					result = text;
				}

				// output a link with the right class/etc
				else {
					result = $("<a />").
						attr("href", href).
						html(text);
				}

				// add the output!
				$(this).append(icon).append(result).append("<br />");
			}
		}
		return $(this);
	};
})( jQuery );
