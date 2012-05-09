describe("GopherParser", function() {
	var p = new GopherParser();

	beforeEach(function() {
		jasmine.getFixtures().fixturesPath = '/jasmine';
	});

	describe("shouldRender", function() {
	  it("shouldn't render text", function() {
	  		expect(p.shouldRender("hello")).toBe(false);
	  });

	  it("should render errors", function() {
	  	var test = "3Sorry, there was a problem with your request\t\tNULL\t70";
	  	expect(p.shouldRender(test)).toBe(true);
	  });

	  it("should render links", function() {
	  	var test = "1The Online Book Initiative\t1/The Online Book Initiative\tgopher.std.com\t70";
	  	expect(p.shouldRender(test)).toBe(true);
	  });

	  it("should render images", function() {
	  	var test = "ILive WebCam (updated every 30 minutes)\t/LiveCam/lastsnap.jpg\tgopher.386server.info\t70";
	  	expect(p.shouldRender(test)).toBe(true);
	  });

	  it("should render text", function() {
	  	var test = "iWelcome to The Frugal Web Servers Gopher portal at\t\terror.host\t1";
	  	expect(p.shouldRender(test)).toBe(true);
	  });
	});

	describe("parseGopher", function() {
		beforeEach(function() {
			loadFixtures('fixtures.html');
		});

		it("should parse", function() {
			var data = $("#full-menu").html().trim();
			var results = p.parseGopher(data);

			var line = results[0];

			expect(line.host).toEqual("error.host");
			expect(line.path).toEqual("");
			expect(line.port).toEqual('1');
			expect(line.title).toEqual("Welcome to The Frugal Web Server's Gopher portal at");
		});

		it("should parse links", function() {
			var data = $("#link-menu").html().trim();
			var results = p.parseGopher(data);

			var line = results[0];

			expect(line.host).toEqual("gopher.386server.info");
			expect(line.path).toEqual("/text/");
			expect(line.port).toEqual('70');
			expect(line.title).toEqual("Text Archive");
		});

		it("should handle junk in the output", function() {
			var data = $("#junk-menu").html().trim();
			var results = p.parseGopher(data);

			var line = results[2];

			expect(line.host).toEqual("gopher.386server.info");
			expect(line.path).toEqual("/text/");
			expect(line.port).toEqual('70');
			expect(line.title).toEqual("Text Archive");
		});
	});

	describe("entryToLink", function() {
		it("should work", function() {
			var e = {
				host: "host",
				port: "70",
				path: "path"
			};

			expect(p.entryToLink(e)).toEqual("/host/path");
		});

		it("should work for non-default ports", function() {
			var e = {
				host: "host",
				port: "7070",
				path: "path"
			};

			expect(p.entryToLink(e)).toEqual("/host:7070/path");
		});

		it("should work for blank path", function() {
			var e = {
				host: "host",
				port: "7070",
				path: ""
			};

			expect(p.entryToLink(e)).toEqual("/host:7070");
		});

		it("should work for slashy path", function() {
			var e = {
				host: "host",
				port: "7070",
				path: "/path/"
			};

			expect(p.entryToLink(e)).toEqual("/host:7070/path/");
		});
	});
});

describe("fromGopher", function() {
	beforeEach(function() {
		loadFixtures('fixtures.html');
	});

	it("should work", function() {
		$("#link-menu").fromGopher();
		var result = '<i class="icon-folder-open">&nbsp;</i><a href="/gopher.386server.info/text/">Text Archive</a><br>';

		expect($("#link-menu").html()).toEqual(result);
	});

	it("should work with junk", function() {
		$("#junk-menu").fromGopher();
		console.log($("#junk-menu").html());
		var result = '<i class="icon-folder-open">&nbsp;</i><a href="/gopher.386server.info/text/">Text Archive</a><br><i class="icon-folder-open">&nbsp;</i><a href="/gopher.386server.info/text/">Text Archive</a><br>';

		expect($("#junk-menu").html()).toEqual(result);
	});


});
