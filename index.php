<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

require 'lib/GopherGetter.php';
require_once 'lib/meekrodb.2.1.class.php';
require_once 'config.php';


/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

//
// default route
//
$app->get('/', function () use($app) {
	$app->render('home.html', array("file" => "intro.html"));
});
$app->get('/about', function () use($app) {
	$app->render('home.html', array("file" => "about.html"));
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
$app->get('/:dest+', function ($dest) use ($app) {
	$app->render('home.html', array("class" => "hide"));
});

/**
 * handle requests for a gopher page
 */
$app->post('/gopher', function () {
	$result = array();

	$url = $_POST["url"];
	$input = isset($_POST["input"]) ? $_POST["input"] : NULL;

	try {
    error_log("$url $input");
	  $x = new GopherGetter($url, $input);
	  if ( $x->isValid() ) {
			$x->get();

			// send binary files and large text back as an attachment
			if ( $x->isBinary() || $x->size() > 1000000 ) {
        error_log("binar!");
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
