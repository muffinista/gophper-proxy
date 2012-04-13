<?php
require 'JG_Cache.php';

class GopherGetter {
  public $uri;
  public $host;
  public $port;
  public $path;


  function __construct($u) {
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
  }

  function isValid() {
	return isSet($this->host) && isSet($this->port) && isSet($this->path);
  }

  function get() {
	$cache = new JG_Cache('/tmp');  //Make sure it exists and is writeable

	$this->result = "";
	$this->errstr = "";
	$this->errno = "";


	$this->result = $cache->get('key', 1000000);
	if ( $this->result === FALSE ) {
	  //	echo $path;

	  $fp = stream_socket_client("tcp://$this->host:$this->port", $this->errno, $this->errstr, 30);

	  if (!$fp) {
		return FALSE;
	  }
	  else {
		fwrite($fp, "$this->path\r\n");
		while (!feof($fp)) {
		  $this->result .= fgets($fp, 1024);
		}
		fclose($fp);
	  }

	  $cache->set($this->uri, $this->result);
	}

	return TRUE;
  }
};
?>