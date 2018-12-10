let qs = require('querystring');

exports.sendHTML = function(res, html) {
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Content-Length', Buffer.byteLength(html));
	res.end(html);
};

exports.parseReceivedData = function(req, cb) {
	var body = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk) {
		body += chunk;
	});
	req.on('end', function() {
		var data = qs.parse(body);
		cb(data);
	});
};

exports.actionForm = function(id, path, label) {
	//render basic form
	var html = '<form method="POST" action=" ' + path + '">' +
		'<input type="hidden" name="id" value="' + id + '">' +
		'<input type="submit" value="' + label + '"/>' +
		'</form>';
	return html;
};

//to add data to the mysql database
exports.add = function(db, req, res) {
	//parse http post data
	exports.parseReceivedData(req, function(work) {
		//add record to work
		db.query(
			"insert into work (hours, date, description) " 
			+ "values (?, ?, ?)",
			[work.hours, work.date, work.description],
			function(err) {
				if (err)
					return err;
				exports.show(db, res);	//display list of records
			}
		);
	});
};

//to delete data from the mysql database
exports.delete = function(db, req, res) {
	exports.parseReceivedData(req, function(work) { //parde http post data
		db.query(	//sql query to delete data
			"delete from work where id=?",
			[work.id],
			function(err) {
				if (err)
					throw err;
				exports.show(db, res);
			}
		);
	});
};

//to update the mysql data
exports.archive = function(db, req, res) {
	exports.parseReceivedData(req, function(work) {
		db.query(
			"update work set archived=1 where id=?",
			[work.id],
			function (err) {
				if (err)
					throw err;
				exports.show(db, res);
			}
		);
	})
};


//the following logic will retrieve mysql data
exports.show = function(db, res, showArchived) { //sql query to fetch work records
	var query = "select * from word " +
		"where archived=? " +
		"order by date desc";
	var archiveValue = (showArchived) ? 1 : 0;
	db.query( 
		query,
		[archiveValue],		//desired work record archive status
		function(err, rows) {
			if (err)
				return err;
			html = (showArchived) ? '' 
			: '<a href="/archived">Archived Work</a><br/>';
			html += exports.workHitlistHtml(rows); //format result as html table
			html += exports.workFormHtml();
			exports.sendHtml(res, html);
		}
	);
};

exports.showArchived = function(db, res) {
	exports.show(db, res, true); //to show only archived work records
};

//renders records to html
exports.workHitlistHtml = function(rows) {
	var html = '<table>';
	for(let i in rows) { 	//render as html table
		html += '<tr>';
		html += '<td>' + rows[i].date + '</td>';
		html += '<td>' + rows[i].hours + '</td>';
		html += '<td>' + rows[i].description + '</td>';
		if (!rows[i].archived) { 	//if word record isn't archived
			html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';	
		}
		html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';	
		html += '</tr>';
	}
	html += '</table>';
	return html;
};

//the html form
exports.workFormHtml = function() { 	//blank html form 
	var html = '<form method="POST" action="/">' +
		'<label>Date (YYYY-MM-DD):<br /></label><input name="date" type="date"><br />' +
		'<label>Hours worked: <br/><input name="hours" type="number"><br />' +
		'<label>Description: <br /><textarea name="description"></textarea><br />' +
		'<button type="submit">Add</button>' +
		'</form>';
	return html;
};

//render archive button
exports.workArchiveForm = function(id) {
	return exports.actionForm(id, '/archive', 'Archive');
};

//render delete button form
exports.workDeleteForm = function(id) {
	return exports.actionForm(id, '/delete', 'Delete');
};
