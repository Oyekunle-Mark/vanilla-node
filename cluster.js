const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	console.log('Master ' + process.pid + ' running.');

	for (let i = 0; i < numCPUs; i++) 
		cluster.fork();		//creater a fork for each core

	cluster.on('exit', function(worker, code, signal) {
		console.log('Worker ' + worker.process.pid + ' ended.');
	});
} else {
	http.createServer(function(req, res) { 		//work done by each worker
		res.writeHead(200);
		res.end('Hello cluster');
	}).listen(8000);

	console.log('Worker process ' + process.pid + ' started');
}
