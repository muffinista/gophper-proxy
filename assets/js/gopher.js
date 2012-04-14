(function( $ ){

	// DirEntity ::= Type User_Name Tab Selector Tab Host Tab Port CR-LF
	// 1The QuIX Auditorium	1/audio	quix.us	70	+

	// regex for matching gopher entries. it didn't quite work in it's original form (see below)
    var entryPattern = /^(.)(.*?)\t(.*?)\t(.*?)\t(\d+).*/;

	var entryTypes = {
		info: { style: 'info' },
		directory: { style: 'info' },
		document: { style: 'document' },
		binhex: { style: 'file' },
		dosbinary: { style: 'file' },
		uuencoded: { style: 'file' },
		binary: { style: 'file' },
		http: { style: 'http' },
		image: { style: 'image' },
		audio: { style: 'audio' },
		unknown: { style: 'unknown' }
	};

	/**
	 * borrowed from phpjs:
	 * @see http://phpjs.org/functions/gopher_parsedir:833
	 */
	var gopher_parsedir = function(dirent) {
		//var entryPattern = /^(.)(.*?)\t(.*?)\t(.*?)\t(.*?)\u000d\u000a$/;
		// http://kevin.vanzonneveld.net
		// +   original by: Brett Zamir (http://brett-zamir.me)
		// *     example 1: var entry = gopher_parsedir('0All about my gopher site.\t/allabout.txt\tgopher.example.com\t70\u000d\u000a');
		// *     example 1: entry.title;
		// *     returns 1: 'All about my gopher site.'

		/* Types
		 * 0 = plain text file
		 * 1 = directory menu listing
		 * 2 = CSO search query
		 * 3 = error message
		 * 4 = BinHex encoded text file
		 * 5 = binary archive file
		 * 6 = UUEncoded text file
		 * 7 = search engine query
		 * 8 = telnet session pointer
		 * 9 = binary file
		 * g = Graphics file format, primarily a GIF file
		 * h = HTML file
		 * i = informational message
		 * s = Audio file format, primarily a WAV file
		 */

		var entry = dirent.match(entryPattern);
		if (entry === null) {
			return {};
		}

		var type = entry[1];
		switch (type) {
		case 'i':
			type = entryTypes.info;
			break;
		case '1':
			type = entryTypes.directory;
			break;
		case '0':
			type = entryTypes.document;
			break;
		case '4':
			type = entryTypes.binhex;
			break;
		case '5':
			type = entryTypes.dosbinary;
			break;
		case '6':
			type = entryTypes.uuencoded;
			break;
		case '9':
			type = entryTypes.binary;
			break;
		case 'h':
			type = entryTypes.html;
			break;
		case 'd':
			type = entryTypes.image;
			break;
		case 's':
			type = entryTypes.audio;
			break;
		default:
			return {
				type: entryTypes.unknown,
				data: dirent
			}; // GOPHER_UNKNOWN
		}
		return {
			type: type,
			title: entry[2],
			path: entry[3],
			host: entry[4],
			port: entry[5]
		};
	},
	 parseGopher = function(data) {
		 var lines = [];
		 data = data.split("\n");
		 for ( var i = 0; i < data.length; i++ ) {
			 lines.push(gopher_parsedir(data[i]));
		 }

		 return lines;
	 },
	 shouldRender = function(d) {
		 var data = d.split("\n");
		 return data[0].match(entryPattern) !== null;
	 },
	 isBinary = function(d) {
		 return /[\x00-\x1F]/.test(d);
	 };

	/**
	 * parse some gophertext and render some pretty HTML from it.
	 *
	 * d - data to parse. if this isn't specified, parse the contents of the target element
	 */
	$.fn.fromGopher = function(d) {
		var data, entries;

		if ( typeof(d) === "undefined" ) {
			data = $(this).html().trim();
		}
		else {
			data = d;
		}

		// make sure we should render -- if this doesn't look like gophertext,
		// we'll just spit back the text itself
		if ( ! shouldRender(data) ) {
			if ( ! isBinary(data) ) {
				// @todo add paragraphs/breaks
				$(this).html(data);
			}
			else {
				$(this).html("Sorry, something went wrong there.");
			}
		}
		else {
			entries = parseGopher(data);

			// reset the container
			$(this).html("");

			for ( var i = 0; i < entries.length; i++ ) {
				var e = entries[i];

				var href = "/" + e.host + e.path;
				var text = e.title;
				var type = e.type;
				var result;


				// if there was no path, don't output a URL
				if ( !e.path || e.path == "" ) {
					result = text;
				}
				else {
					result = $("<a />").
						attr("href", href).
						addClass("gopher-" + type.style).
						html(text);
				}

				$(this).append(result).append("<br />");
			}
		}
		return $(this);
	};
})( jQuery );
