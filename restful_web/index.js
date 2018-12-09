var http = require('http');
var url = require('url');
var fs = require('fs');

//SSL key and cert given as options
var options = {
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./key-cert.pem')
};

// declare a js array to hold data
var items = [];

//pass options object first
var server = http.createServer(options, function(req, res) {
	switch(req.method) {
		case 'POST': 	// for create processes
			var item = '';
			req.setEncoding('utf8'); // encode the incoming data events as utf-8 strings
			req.on('data', function(chunk) {
				item += chunk;
			});
			req.on('end', function() {
				items.push(item); //push to storage
				res.end('OK\n');
			});
			break;
		case 'GET': 	//for read operations
			var body = items.map(function(item, i) {
				return i + ')' + item;
			}).join('\n');
			res.setHeader('Content-Length', Buffer.byteLength(body));
			res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
			res.end(body);
			break;
		case 'DELETE': 	//for delete operations
			var path = url.parse(req.url).pathname;
			var i = parseInt(path.slice(1), 10); // carry out type conversion on the pathname
			if (isNaN(i)) {
				res.statusCode = 400;
				res.end('Invalid item id');
			} else if (!items[i]) {
				res.statusCode = 404;
				res.end('Item not found');
			} else {
				items.splice(i, 1);
				res.end('OK\n');
			}
			break;
		case 'PUT': 	//for update operations
			var path = url.parse(req.url).pathname;
			var i = parseInt(path.slice(1), 10);
			if (isNan(i)) { 	//check if number is valid
				res.statusCode = 400;
				res.end('Invalid item id');
			} else if (!item[i]) { 	// if the index does not exist
				res.statusCode = 404;
				res.end('Item not found');
			} else {
				var item = '';
				req.on('data', function(chunk) { 	// append the data to the stream
					item += chunk;
				req.setEncoding('utf8'); 	//encode the incoming data as utf-8 strings
				});
				req.on('end', function() { 	// when the data has been read
					item.splice(i, i, item); // replace the index with the data stream
					res.end('OK\n');
				});
			}
				break;
	}
});

server.listen(3000, function() {
	console.log("Server listening on port 3000");
});
