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

		// split the incoming URI on :// to prevent too much fooling 
		// around and to make sure that we normalize our data
		$u = array_pop(explode("://", $u));


		// strip any leading slash from the path
	  $u = ltrim($u, '/');
		$this->uri = "gopher://$u";

		// split host and port from uri
		$data = parse_url($this->uri);

		$this->host = $data['host'];
		$this->port = array_key_exists('port', $data) ? $data['port'] : 70;

		// only allow port 70, or if ALLOW_ALL_PORTS is true, also allow ports over 1024
		if ( $this->port != 70 && ( ALLOW_ALL_PORTS != true || $this->port < 1024 ) ) {
		  throw new Exception("Port violation");
		}

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
  }

  function isValid() {
		return isSet($this->host) && isSet($this->port) && isSet($this->path);
  }


  function isBinary() {
		return $this->cache->isBinary($this->key);
  }

  function isImage() {
		return $this->cache->isImage($this->key);
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
			//	  error_log("tcp://$this->host:$this->port\t$this->input");
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

		$this->logTraffic($this->host, $this->path);
		return TRUE;
  }

  function size() {
		return $this->cache->size($this->key);
  }

  function logTraffic($host, $selector) {
		if ( LOG_STATS != true ) {
		  return;
		}

		$ip_address = ip2long($_SERVER['REMOTE_ADDR']);

		DB::insert('traffic', array(
									'hostname' => $host,
									'selector' => $selector,
									'remote_ip' => $ip_address,
									'filesize' => $this->size(),
									'request_at' => DB::sqleval("NOW()")
									));

  }


};
?>