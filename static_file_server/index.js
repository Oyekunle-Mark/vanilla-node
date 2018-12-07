var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var root = __dirname

var server = http.createServer(function(req, res) {
	var url = parse(req.url); // parse the url to obtain the pathname
	var path = join(root, url.pathname); //construct the absolute path
	fs.stat(path, function(err, stat) { //check if the file exists
		if (err) { 
			if ('ENOENT' == err.code) { 	//file does not exist
				res.statusCode = 404;
				res.end('Not Found');
			} else {
				res.statusCode = 500;
				res.end('Internal Server Error');
			}
		} else {
			res.setHeader('Content-Length', stat.size);
			var stream = fs.createReadStream(path);
			stream.pipe(res);
			stream.on('error', function(err) {
				res.statusCode = 500;
				res.end('Internal Server Error');
			});
		}
	})
});

server.listen(3000, function() {
	console.log('Server listening on port 3000.');
});
