<?php
require 'Slim/Slim.php';
require 'Slim/View.php';

require 'GopherGetter.php';

require_once 'meekrodb.2.0.class.php';
require_once 'config.php';

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

	$app->contentType(mime_content_type($path));
	header("Content-type: " . mime_content_type($path));
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

	try {
	  $x = new GopherGetter($url, $input);
	  if ( $x->isValid() ) {
		$x->get();

		// send binary files and large text back as an attachment
		if ( $x->isBinary() || $x->size() > 1000000 ) {
		  $result['url'] = "/file?name=" . basename($_POST["url"]) . "&path=" . $x->urlFor();
		  $result['image'] = $x->isImage();

		}
		else {
		  $result['url'] = $_POST["url"];
		  $result['data'] = $x->result;

		  if (!mb_check_encoding($result['data'], 'UTF-8')) {
			$result['data'] = utf8_encode($result['data']);
		  }
		}
	  }
	  else {
		$result['url'] = $_POST["url"];
		$result['data'] = "3Sorry, there was a problem with your request\t\tNULL\t70";
	  }
	} catch(Exception $e) {
	  $result['url'] = $_POST["url"];
	  $result['data'] = "3Sorry, there was a problem with your request (" . $e->getMessage() . ")\t\tNULL\t70";
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
