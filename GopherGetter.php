<?php
require 'Cache.php';

class GopherGetter {
  public $uri;
  public $host;
  public $port;
  public $path;
  public $key;

  public $input;

  private $cache;

  function __construct($u, $i = NULL) {
	$this->cache = new Cache('assets/cache');  //Make sure it exists and is writeable

	$this->uri = "gopher:/$u";

	// split host and port from uri
	$data = parse_url($this->uri);

	$this->host = $data['host'];
	$this->port = array_key_exists('port', $data) ? $data['port'] : 70;

	// strip the leading slash from the path
	if ( array_key_exists('path', $data) ) {
	  $this->path = ltrim($data['path'], '/');
	}
	else {
	  $this->path = "/";
	}

	$this->path = urldecode($this->path);
	$this->input = $i;

	$this->key = "$this->host:$this->port$this->path?$this->input";
	error_log("KEY: $this->key");
  }

  function isValid() {
	return isSet($this->host) && isSet($this->port) && isSet($this->path);
  }


  function isBinary() {
	return $this->cache->isBinary($this->key);
  }

  function urlFor() {
	return $this->cache->url($this->key);
  }

  function get() {

	$this->result = "";
	$this->errstr = "";
	$this->errno = "";


	$this->result = $this->cache->get($this->key);
	if ( $this->result === FALSE ) {
	  error_log("tcp://$this->host:$this->port\t$this->input");
	  $fp = stream_socket_client("tcp://$this->host:$this->port", $this->errno, $this->errstr, 30);

	  if (!$fp) {
		return FALSE;
	  }
	  else {

	  $data = $this->path;
	  if ( isset($this->input) && $this->input != "" ) {
	  	 $data .= "\t$this->input";
	  }

		fwrite($fp, "$data\r\n");
		while (!feof($fp)) {
		  $this->result .= fgets($fp, 1024);
		}
		fclose($fp);
	  }

	  $this->cache->set($this->key, $this->result);
	}

	return TRUE;
  }
};
?>