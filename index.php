<?php

error_reporting(1);

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

require __DIR__ . '/vendor/autoload.php';

require 'lib/GopherGetter.php';

define('LOG_STATS', (getenv('MYSQL_USER') !== FALSE));

if ( defined('LOG_STATS') && LOG_STATS == true ) {
    DB::$user = getenv('MYSQL_USER');
    DB::$password = getenv('MYSQL_PASSWORD');
    DB::$dbName = getenv('MYSQL_DATABASE');
    DB::$host = getenv('MYSQL_HOST');
}

define('CACHE_LIFETIME', 3600);
define('CACHE_PATH', "/tmp/gopher");
define('MAX_FILESIZE', 10000000);


$app = new \Slim\App();

// Get container
$container = $app->getContainer();
$container['view'] = function ($container) {
    return new \Slim\Views\PhpRenderer('templates/');
};

//
// default route
//
$app->get('/', function (Request $request, Response $response, array $args) use($app) {
    $params = array();
    if ( getenv('START_REQUEST') !== FALSE ) {
        $params['result'] = loadGopher(getenv('START_REQUEST'), getenv('START_INPUT'));
    }
    else {
        $params['file'] = "templates/intro.html";
    }

    return $this->view->render($response, 'home.html', $params);
});

$app->get('/about', function (Request $request, Response $response, array $args) use($app) {
    return $this->view->render($response, 'home.html', array("file" => "templates/about.html"));
});

/**
 * handle binary file requests
 */
$app->get('/file', function (Request $request, Response $response, array $args) use($app) {
	$path = $_GET['path'];
	$file = $_GET['name'];

	// if you have sendfile, you can use this
	// header("X-Sendfile: $path");
	// header("Content-type: application/octet-stream");
	// header('Content-Disposition: attachment; filename="' . basename($file) . '"');

    $response->withHeader('Content-Type', mime_content_type($path))
        ->withHeader('Content-Disposition', 'attachment; filename="' . basename($file) . '"')
        ->withHeader('Content-Length', filesize($path));

    header("Content-type: " . mime_content_type($path));
    header('Content-Disposition: attachment; filename="' . basename($file) . '"');
	header("Content-Length: ". filesize($path));
	readfile($path);

    return $response;
});

/**
 * this will handle incoming requests that have a gopher URL tacked onto the end
 */
$app->get('/{dest:.*}', function (Request $request, Response $response, array $args) use($app) {    
	//$app->render('home.html', array("class" => "hide"));
    return $this->view->render($response, 'home.html', array("class" => "hide"));
});

/**
 * handle AJAX requests for a gopher page
 */
$app->post('/gopher', function () {
	$url = $_POST["url"];
	$input = isset($_POST["input"]) ? $_POST["input"] : NULL;
    
	try {
        $result = loadGopher($url, $input);
	} catch(Exception $e) {
        $result['url'] = $_POST["url"];
        $result['data'] = "3Sorry, there was a problem with your request (" . $e->getMessage() . ")\t\tNULL\t70";
	}

	echo json_encode($result);
});

$app->run();

function loadGopher($url, $input) {
	$result = array();
    $x = new GopherGetter($url, $input);
    if ( $x->isValid() ) {
        $success = $x->get();

        if ( $success == FALSE ) {
            $result['url'] = $url;
            $result['data'] = "3Sorry, there was a problem with your request - " . $x->errstr . "\t\tNULL\t70";
        }
        // send binary files and large text back as an attachment
        else if ( $x->isBinary() || $x->size() > 1000000 ) {
            $result['url'] = "/file?name=" . basename($url) . "&path=" . $x->urlFor();
            $result['image'] = $x->isImage();
        }
        else {
            $result['url'] = $url;
            $result['data'] = $x->result;
            if (!mb_check_encoding($result['data'], 'UTF-8')) {
                $result['data'] = utf8_encode($result['data']);
            }
        }
    }
    else {
        $result['url'] = $url;
        $result['data'] = "3Sorry, there was a problem with your request\t\tNULL\t70";
    }

    return $result;
}
