DROP TABLE IF EXISTS traffic;
CREATE TABLE traffic (
	   hostname varchar(100) NOT NULL,
	   selector varchar(100) NOT NULL,
	   remote_ip INT UNSIGNED NOT NULL,
	   filesize INT UNSIGNED NOT NULL DEFAULT 0,
	   request_at datetime NOT NULL
);

CREATE INDEX host_traffic_idx ON traffic(hostname, request_at);
CREATE INDEX host_selector_traffic_idx ON traffic(hostname, selector, request_at);
