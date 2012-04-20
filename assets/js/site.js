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
	};


	/**
	 * click handler for gopher menus. pass the URI along to the proxy
	 * server, and handle the results.
	 */
	var loadGopherUri = function(u) {
		$.ajax({
			url: "/gopher",
			type: 'post',
			dataType: 'json',
			data: {
				url: u
			}
		}).done(function ( data ) {

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
			}
			else {
				// binary file (or something we can't render) -- redirect to cached copy on proxy server
				window.location.replace(data.url);
			}

			// @todo handle errors

		});
	};

	/**
	 * handle clicks on gopher selectors
	 */
	$("#gopher,#breadcrumb").on("click", "a", function() {
		loadGopherUri($(this).attr("href"));
		return false;
	});


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
