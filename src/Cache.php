<?php
namespace App;

define('CACHE_LIFETIME', 3600);
define('CACHE_PATH', "/tmp/gopher");
define('MAX_FILESIZE', 10000000);

class Cache {
	function __construct($dir) {
		$this->dir = $dir;
		$this->mkdir_p($dir);
	}
	
	private function _name($key) {
		$k = sha1($key);
		return sprintf("%s/%s/%s", $this->dir, substr($k, 0, 2), $k);
	}
	
	public function hasKey($key, $expiration = CACHE_LIFETIME) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		error_log("PATH $cache_path");
		if (!@file_exists($cache_path)) {
			return FALSE;
		}
		
		if (filemtime($cache_path) < (time() - $expiration)) {
			$this->clear($key);
			return FALSE;
		}
		
		return TRUE;
	}
	
	public function isBinary($key, $expiration = CACHE_LIFETIME) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		
		error_log("PATH $cache_path");
		$mime = mime_content_type($cache_path);
		error_log($mime);
		
		// The file is binary if it's neither text nor a message, and if
		// it's an application/octet-stream but the file doesn't start with an i
		// (which is a lot of gopher files)
		return (
			substr($mime, 0, 4) != 'text' &&
			substr($mime, 0, 7) != 'message' &&
			!($mime == 'application/octet-stream' && substr(file_get_contents($cache_path, FALSE, NULL, 0, 1), 0, 1) == 'i')
		);
	}
	
	public function isImage($key, $expiration = CACHE_LIFETIME) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		
		// return mime type ala mimetype extension
		$finfo = finfo_open(FILEINFO_MIME);
		
		//check to see if the mime-type starts with 'text' -- if not, BINARY
		return substr(finfo_file($finfo, $cache_path), 0, 5) == 'image';
	}
	
	public function url($key) {
		$cache_path = $this->_name($key);
		return $cache_path;
	}
	
	public function get($key, $expiration = CACHE_LIFETIME) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			error_log("problem with " . $this->dir);
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		
		if (!@file_exists($cache_path)) {
			return FALSE;
		}
		
		if (filemtime($cache_path) < (time() - $expiration)) {
			$this->clear($key);
			return FALSE;
		}
		
		if (!$fp = @fopen($cache_path, 'rb')) {
			return FALSE;
		}
		
		flock($fp, LOCK_SH);
		
		$cache = '';
		
		if (filesize($cache_path) > 0) {
			$cache = fread($fp, filesize($cache_path));
		}
		else {
			$cache = NULL;
		}
		
		flock($fp, LOCK_UN);
		fclose($fp);
		
		return $cache;
	}
	
	public function size($key, $expiration = CACHE_LIFETIME) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		
		if (!@file_exists($cache_path)) {
			return FALSE;
		}
		
		return filesize($cache_path);
	}
	
	private function mkdir_p($path) {
		if (!is_dir($path)) {
			$this->mkdir_p(dirname($path));
			mkdir($path, 0777);
		}
	}
	
	public function set($key, $data) {
		if ( !is_dir($this->dir) OR !is_writable($this->dir)) {
			return FALSE;
		}
		
		$cache_path = $this->_name($key);
		error_log("PATH $cache_path");
		
		$this->mkdir_p(dirname($cache_path));
		
		
		if ( ! $fp = fopen($cache_path, 'wb')) {
			return FALSE;
		}
		
		if (flock($fp, LOCK_EX)) {
			fwrite($fp, $data);
			flock($fp, LOCK_UN);
		}
		else {
			return FALSE;
		}
		
		fclose($fp);
		@chmod($cache_path, 0777);
		return TRUE;
	}
	
	public function clear($key) {
		$cache_path = $this->_name($key);
		
		if (file_exists($cache_path)) {
			unlink($cache_path);
			return TRUE;
		}
		
		return FALSE;
	}
}
