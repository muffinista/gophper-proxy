(function( $ ){

	//DirEntity ::= Type User_Name Tab Selector Tab Host Tab Port CR-LF
	//1The QuIX Auditorium	1/audio	quix.us	70	+
    var entryPattern = /^(.)(.*?)\t(.*?)\t(.*?)\t(\d+).*/;

	function gopher_parsedir (dirent) {
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
			type = 255; // GOPHER_INFO
			break;
		case '1':
			type = 1; // GOPHER_DIRECTORY
			break;
		case '0':
			type = 0; // GOPHER_DOCUMENT
			break;
		case '4':
			type = 4; // GOPHER_BINHEX
			break;
		case '5':
			type = 5; // GOPHER_DOSBINARY
			break;
		case '6':
			type = 6; // GOPHER_UUENCODED
			break;
		case '9':
			type = 9; // GOPHER_BINARY
			break;
		case 'h':
			type = 254; // GOPHER_HTTP
			break;
		default:
			return {
				type: -1,
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
	};

	var parseGopher = function(data) {
		var lines = [];
		data = data.split("\n");
		for ( var i = 0; i < data.length; i++ ) {
			lines.push(gopher_parsedir(data[i]));
		}

		return lines;
	};

	var methods = {
		init : function( options ) {

		},
		shouldRender : function( ) {
			var data = $(this).html().trim().split("\n");
			return data[0].match(entryPattern) !== null;
		},
		parse : function( ) {
			var data = $(this).html().trim();
			return parseGopher(data);
		},
		fromGopher : function(d) {
			var data, entries;

			if ( typeof(d) === "undefined" ) {
				data = $(this).html().trim();
			}
			else {
				data = d;
			}
			entries = parseGopher(data);

			$(this).html("");

			for ( var i = 0; i < entries.length; i++ ) {
				var e = entries[i];
				var href = "/" + e.host + e.path;
				var text = e.title;
				var result;

				if ( e.path == "" ) {
					result = text;
				}
				else {
					result = $("<a />").attr("href", href).html(text);
				}

				$(this).append(result).append("<br />");
			}

		}
	};

	$.fn.gopher = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.gopher' );
		}
	};

})( jQuery );

//https://raw.github.com/kvz/phpjs/master/functions/net-gopher/gopher_parsedir.js
