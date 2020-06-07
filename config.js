var mysql = require('mysql');

module.exports = {
	connection : mysql.createConnection ({
		host : 'localhost',
		database : 'matrimony',//'DBMSproject',
		user : '', // mysql username
	 	password : '', //mysql password
	})
}
