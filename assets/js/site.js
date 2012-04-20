$(document).ready(function() {

	/**
	 * on stateChange events, we will get the data from that page
	 * (stored when loadGopherUri is complete), and re-render the
	 * gopher output .
	 */
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var state = History.getState(); // Note: We are using History.getState() instead of event.state
		$("#gopher").html(state.data.data).fromGopher();
    });

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

				// render the content
				$("#gopher").html(data.data).fromGopher();
			}
			else {
				// binary file (or something we can't render) -- redirect to source
				window.location.replace(data.url);
			}

			// @todo handle errors

		});
	};

	$("#gopher").on("click", "a", function() {
		loadGopherUri($(this).attr("href"));
		return false;
	});


	// Handle existing URI on the browser's URL
	if ( window.location.pathname != "/" ) {
		loadGopherUri(window.location.pathname);
	}
});
