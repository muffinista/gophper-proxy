<?php
require 'Slim/Slim.php';
require 'Slim/View.php';

require 'GopherGetter.php';

$app = new Slim();

/**
 * Step 3: Define the Slim application routes
 */


//
// default route
//
$app->get('/', function () use($app) {
	$app->render('home.html');
});
$app->get('/about', function () use($app) {
	$app->render('home.html');
});
$app->get('/code', function () use($app) {
	$app->render('home.html');
});

/**
 * handle binary file requests
 */
$app->get('/file', function () use($app) {
	$path = $_GET['path'];
	$file = $_GET['name'];

	// if you have sendfile, you can use this
	// header("X-Sendfile: $path");
	// header("Content-type: application/octet-stream");
	// header('Content-Disposition: attachment; filename="' . basename($file) . '"');

	header("Content-type: application/octet-stream");
	header('Content-Disposition: attachment; filename="' . basename($file) . '"');
	header("Content-Length: ". filesize($path));
	readfile($path);
});

/**
 * this will handle incoming requests that have a gopher URL tacked onto the end
 */
$app->notFound(function () use ($app) {
	$app->render('home.html');
});



/**
 * handle requests for a gopher page
 */
$app->post('/gopher', function () {
	$result = array();

	$url = $_POST["url"];
	$input = isset($_POST["input"]) ? $_POST["input"] : NULL;

	$x = new GopherGetter($url, $input);
	if ( $x->isValid() ) {
	  $x->get();

	  if ( !$x->isBinary() ) {
		$result['url'] = $_POST["url"];
		$result['data'] = $x->result;
	  }
	  else {
		$result['url'] = "/file?name=" . basename($_POST["url"]) . "&path=" . $x->urlFor();
	  }
	}
	else {
	  $result['error'] = "Sorry, there was a problem";
	}

	echo json_encode($result);

});

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This is responsible for executing
 * the Slim application using the settings and routes defined above.
 */
$app->run();
