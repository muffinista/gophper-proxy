$(document).ready(function() {
  /**
   * on stateChange events, we will get the data from that page
   * (stored when loadGopherUri is complete), and re-render the
   * gopher output.
   */
  History.Adapter.bind(window, 'statechange', function() {
    var state = History.getState();

    if ( state.data.data ) {
      $("#gopher").html(state.data.data).fromGopher();

      // update our breadcrumb nav
      updateBreadcrumb(state.data.url);
    }
    else {
      $("#gopher,#breadcrumb").fadeOut().html("");
      $("#intro").fadeIn();
    }
  });


  /**
   * very simple methods to manage a 'please wait' spinner
   */
  var spinner = {
    spin : function() {
      $("#spinner img").fadeIn();
    },
    unspin : function() {
      $("#spinner img").fadeOut();
    }
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

      // hide the intro text if it is still there
      $("#intro").hide();
      $("#gopher").show();

    var displayError = function() {
      spinner.unspin();
      $("#gopher").show().html("Sorry, there was a problem with your request, please try again.");
      $('html,body').animate({scrollTop: $("#gopher").offset().top}, 'slow');
    };

    spinner.spin();

    $.ajax({
      url: "/gopher",
      type: 'post',
      dataType: 'json',
      data: data,
        error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                alert(thrownError);
            }
        }
    }).done(function ( data ) {
      spinner.unspin();

      if ( typeof(params.onComplete) !== "undefined" ) {
        params.onComplete();
      }

      // did we get valid data? if not, display the error
      if ( data.error ) {
        $("#gopher").html(data.error);
      }

      //
      // we got data, let's render it
      //
      else if ( data.data && data.data !== "" ) {
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

        // Google Analytics support
        if ( window._gaq ) {
          _gaq.push(['_trackPageview']);
        }
      }


      //
      // at this point, we probably just have a URL for a file, link to it
      //
      else {
        // if it's an image, load in a colorbox
        if ( data.image ) {
          $.colorbox({photo: true, href: data.url});
        }
        else {
          // binary file (or something we can't render) -- redirect to cached copy on proxy server
          window.location.replace(data.url);
        }
      }

    }).fail(function(jqXHR, textStatus) {
      displayError();
    });

  };

  /**
   * handle clicks on gopher selectors
   */
  $("#gopher,#breadcrumb,#intro .as-html").on("click", "a", function() {
    loadGopherUri({
      url : $(this).attr("href")
    });
    return false;
  }).on("submit", "form", function() {
    loadGopherUri({
      url : $(this).attr("action"),
      input : $(this).find("input").val()
    });
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
   * Handle existing URI on the browser's URL -- we'll only do this if the intro is hidden, 
   * and there's something to load. We'll add the 'hide' class to the output in home.html to trigger this.
   */
  if ( window.location.pathname != "/" && $("#intro").hasClass("hide") ) {
    loadGopherUri(unescape(window.location.pathname));
  }
});
