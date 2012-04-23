/*

You can now create a spinner using any of the variants below:

$("#el").spin(); // Produces default Spinner using the text color of #el.
$("#el").spin("small"); // Produces a 'small' Spinner using the text color of #el.
$("#el").spin("large", "white"); // Produces a 'large' Spinner in white (or any valid CSS color).
$("#el").spin({ ... }); // Produces a Spinner using your custom settings.

$("#el").spin(false); // Kills the spinner.

*/
(function($) {
	$.fn.spin = function(opts, color) {
		var presets = {
			"tiny": { lines: 8, length: 2, width: 2, radius: 3 },
			"small": { lines: 8, length: 4, width: 3, radius: 5 },
			"large": { lines: 10, length: 8, width: 4, radius: 8 }
		};
		if (Spinner) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data();

				if (data.spinner) {
					data.spinner.stop();
					delete data.spinner;
				}
				if (opts !== false) {
					if (typeof opts === "string") {
						if (opts in presets) {
							opts = presets[opts];
						} else {
							opts = {};
						}
						if (color) {
							opts.color = color;
						}
					}
					data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
				}
			});
		} else {
			throw "Spinner class not available.";
		}
	};
})(jQuery);

$(document).ready(function() {
	/**
	 * on stateChange events, we will get the data from that page
	 * (stored when loadGopherUri is complete), and re-render the
	 * gopher output .
	 */
    History.Adapter.bind(window,'statechange',function() {
        var state = History.getState();
		$("#gopher").html(state.data.data).fromGopher();
    });


	/**
	 * output a breadcrumb which will just split the current URI and
	 * link to each level
	 */
	var updateBreadcrumb = function(url) {
		var bc = unescape(url).split("/");
		var crumb = "";
		var li;

		$("#breadcrumb").html("<ul class='breadcrumb' />");

		for ( var i = 0; i < bc.length; i++ ) {
			crumb = crumb + bc[i] + "/";


			li = $("<li />");
			if ( i + 1 == bc.length ) {
				$(li).addClass("active");
			}

			$(li).html($("<a />").attr("href", crumb).html(bc[i]));

			if ( i + 1 < bc.length ) {
				$(li).append($("<span />").addClass("divider").html("/"));
			}

			$(".breadcrumb").append(li);
		}

		$(".breadcrumb").after("<span class='spinny' />");
	};


	/**
	 * click handler for gopher menus. pass the URI along to the proxy
	 * server, and handle the results.
	 */
	var loadGopherUri = function(params) {
		var data = {};

		if ( typeof(params) === "string" ) {
			data.url = params;
		}
		else {
			data.url = params.url;
			data.input = params.input;
		}


		$.ajax({
			url: "/gopher",
			type: 'post',
			dataType: 'json',
			data: data
		}).done(function ( data ) {

			if ( typeof(params.onComplete) !== "undefined" ) {
				params.onComplete();
			}

			// hide the intro text if it is still there
			$("#intro").hide();

			// did we get valid data? if so, try and render it
			if ( data.data ) {

				// update browser url and store the data hash for
				// later use. for now we'll set the title to be the
				// URI as well
				History.pushState(data, data.url, data.url);

				$("form input[name=uri]").val(data.url);

				updateBreadcrumb(data.url);

				// render the content
				$("#gopher").html(data.data).fromGopher();

				$('html, body').animate({ scrollTop: 0 }, 0);
			}
			else {
				// binary file (or something we can't render) -- redirect to cached copy on proxy server
				window.location.replace(data.url);
			}

			// @todo handle errors

		});
	};

	var spinOpts = { top : 2, lines: 8, length: 2, width: 2, radius: 3 };

	/**
	 * handle clicks on gopher selectors
	 */
	$("#gopher,#breadcrumb").on("click", "a", function() {
		var link = $(this);

		$(this).next(".spinny").spin(spinOpts);
		loadGopherUri({
			url : $(this).attr("href"),
			onComplete : function() {
				$(link).next("span").spin(false);
			}
		});
		return false;
	}).on("submit", "form", function() {
		var link = $(this);
		$(this).find(".spinny").spin(spinOpts);

		loadGopherUri({
			url : $(this).attr("action"),
			input : $(this).find("input").val(),
			onComplete : function() {
				$(this).find(".spinny").spin(false);
			}
		});
		return false;
	});;


	/**
	 * handle URI form submission
	 */
	$("form.gopher-uri").on("submit", function() {
		loadGopherUri($(this).find("input[name=uri]").val());
		return false;
	});


	/**
	 * Handle existing URI on the browser's URL
	 */
	if ( window.location.pathname != "/" ) {
		loadGopherUri(unescape(window.location.pathname));
	}
});
