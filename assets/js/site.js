$(document).ready(function() {

	// Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var state = History.getState(); // Note: We are using History.getState() instead of event.state
		$("#gopher").html(state.data.data).fromGopher();
    });

	var loadGopherUri = function(u) {
		$.ajax({
			url: "/gopher",
			type: 'post',
			dataType: 'json',
			data: {
				url: u
			}
		}).done(function ( data ) {
			if ( data.data ) {
				// update browser url
				History.pushState(data, data.url, data.url);

				$("#gopher").html(data.data).fromGopher();
			}
			else {
				// binary file (or something we can't render) -- redirect to source
				window.location.replace(data.url);
			}
		});
	};

	$("#gopher").on("click", "a", function() {
		loadGopherUri($(this).attr("href"));
		return false;
	});


	if ( window.location.pathname != "/" ) {
		loadGopherUri(window.location.pathname);
	}
});
