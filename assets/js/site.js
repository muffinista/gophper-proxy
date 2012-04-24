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


	var spin = function() {
		$("#spinner img").fadeIn();
	};
	var unspin = function() {
		$("#spinner img").fadeOut();
	};

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


		spin();

		$.ajax({
			url: "/gopher",
			type: 'post',
			dataType: 'json',
			data: data
		}).done(function ( data ) {

			unspin();

			if ( typeof(params.onComplete) !== "undefined" ) {
				params.onComplete();
			}

			// hide the intro text if it is still there
			$("#intro").hide();

			// did we get valid data? if so, try and render it
			if ( data.error ) {
				$("#gopher").html(data.error);
			}
			else if ( data.data ) {
				// update browser url and store the data hash for
				// later use. for now we'll set the title to be the
				// URI as well
				History.pushState(data, data.url, data.url);

				// update the URI in the header
				$("form input[name=uri]").val(data.url);

				// update our breadcrumb nav
				updateBreadcrumb(data.url);

				// render the content
				$("#gopher").html(data.data).fromGopher();

				// scroll to the top of the page
				$('html, body').animate({ scrollTop: 0 }, 0);
			}
			else {
				if ( data.image ) {
					$.colorbox({photo: true, href: data.url});
				}
				else {
					// binary file (or something we can't render) -- redirect to cached copy on proxy server
					window.location.replace(data.url);
				}
			}

		}).fail(function(jqXHR, textStatus) {
			$("#gopher").html("Sorry, there was a problem with your request, please try again.");
		});

	};

	/**
	 * handle clicks on gopher selectors
	 */
	$("#gopher,#breadcrumb").on("click", "a", function() {
		var link = $(this);


		loadGopherUri({
			url : $(this).attr("href")
		});
		return false;
	}).on("submit", "form", function() {
		var link = $(this);

		spin();
		loadGopherUri({
			url : $(this).attr("action"),
			input : $(this).find("input").val()
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
