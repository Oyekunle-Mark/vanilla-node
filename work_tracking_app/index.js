let http = require('http');
let work = require('./lib/worktrack');
let mysql = require('mysql');

//connect to mysql
let db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'myuser',
	password: 'password17',
	database: 'timetrack'
});

let server = http.createServer(function(req, res) {
	switch (req.method) {
		case 'POST':
			switch (req.url) {
				case '/':
					work.add(db, req, res);
					break;
				case '/archive':
					work.archive(db, req, res);
					break;
				case '/delete' :
					work.delete(db, req, res);
					break;
			}
		case 'GET':
			switch (req.url) {
				case '/':
					work.show(db, res);
					break;
				case '/archived':
					work.showArchived(db, res);
			}
			break;
	}
});

db.query(
	"create table if not exists work (" 
	+ "id int(10) not null auto_increment, "
	+ "hours decimal(5, 2) default 0, "
	+ "date date, "
	+ "archived int(1) dafult 0, "
	+ "description longtext, "
	+ "primary key(id)",
	function (err) {
		if (err) 
//            return err;
		console.log('Server started...');
		server.listen(3000, '127.0.0.1');
	}
);
