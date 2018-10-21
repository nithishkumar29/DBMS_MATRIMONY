var express = require('express');
var fs = require('fs');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection ({
	host : 'localhost',
	database : 'login',
	user : 'root',
	password : 'root',
});

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

users = [];
connections = [];

var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.get('/',function(req,res) {
	res.render( 'start', {
		username: 'hi'
	});
})

var server = app.listen(8081, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(host+" "+port);
})