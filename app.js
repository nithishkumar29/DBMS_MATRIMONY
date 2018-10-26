var express = require('express');
var path=require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection ({
	host : 'localhost',
	database : 'DBMSproject',
	user : 'root',
	password : 'root',
});

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(require('path').join(__dirname + '/Public')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

users = [];
connections = [];

var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.get('/',function(req,res) {
	res.render( 'start', {
		passwordIncorrect: ' ',
		userNotRegistered: ' '
	});
})

app.get('/login',function(req,res) {
	res.render( 'login', {
		passwordIncorrect: ' ',
		userNotRegistered: ' ',
		loginAgain:' '
	});
})

app.get('/register',function(req,res) {
	res.render( 'register', {
		pnameTaken:' ',
		emailTaken:' '
	});
})

app.get('/dashboard',function(req,res) {
	if(req.session.user&&req.session){
		res.render( 'welcome', {
			user: req.session.user
		});
	}
	else{
		console.log('Login again!!');
		res.render('login',{
			passwordIncorrect: ' ',
			userNotRegistered: ' ',
			loginAgain:'Session expired, Login Again!! '
		});
	}
})

app.post('/login',urlencodedParser,function(req,res){
	var	email = req.body.userEmail;
	var	password = req.body.userPassword;
	connection.query('SELECT * FROM users WHERE email = ?',[email],function(error, results, fields){
		if(error){
			console.log("error");
			res.redirect('/login');
		}
		if(email.length == 0 || password.length == 0)
		{
		res.render( 'login', {
			passwordIncorrect: 'Insufficient Credentials',
			userNotRegistered: ' ',
			loginAgain: ' '
			});	
		}
		else{
			if(results.length > 0){
				if(results[0].password==password){
					var newUser = {
						fname:results[0].fname, 
						lname:results[0].lname, 
						pname:results[0].pname,
						gender:results[0].gender,
						description:results[0].description,
						DOB:results[0].DOB,
						religion:results[0].religion,
						motherTongue:results[0].motherTongue,
						userHeight:results[0].userHeight,
						mStatus:results[0].mStatus,
						privacy:results[0].privacy,
						qualification:results[0].qualification,
						college:results[0].college,
						occupation:results[0].occupation,
						country:results[0].country,
						salary:results[0].salary,
						email: req.body.userEmail, 
						password: req.body.userPassword
					};
					req.session.user=newUser;
					//Users.push(newUser);
					console.log("Login Successful");
					console.log(req.session);
					res.redirect('/dashboard');
				}
				else{
					console.log("Password Incorrect");
					res.render( 'login', {
						passwordIncorrect: 'password Incorrect',
						userNotRegistered: ' ',
						loginAgain: ' '
					});
				}
			}
			else{
				console.log("Email Doesn't exist");
				res.render( 'login', {
					userNotRegistered: 'User Not Registered!! Click the Register button',
					passwordIncorrect: ' ',
					loginAgain: ' '
				});
			}
		}
	});
})

app.post('/register',urlencodedParser,function(req,res)
{
	var fname = req.body.fname;
	var lname = req.body.lname;
	var pname = req.body.pname; 
	var gender = req.body.gender;
	var email = req.body.email;
	var password = req.body.password;
	var description = req.body.description;
	var DOB = req.body.DOB;
	var religion = req.body.religion;
	var motherTongue = req.body.motherTongue;
	var userHeight = req.body.userHeight;
	var mStatus = req.body.mStatus;
	var privacy = req.body.privacy;
	var qualification = req.body.qualification;
	var college = req.body.college;
	var occupation = req.body.occupation;
	var country = req.body.country;
	var salary = req.body.salary;
	connection.query('SELECT * FROM users WHERE pname = ?',[pname],function(error, results, fields)
	{
		if(error){
			console.log("error at query");
			res.send({
				"code":400,
				"failed":"Error ocurred"
			});
		}
		else
		{
			if(results.length > 0)
			{
				console.log("USER EXISTS");
				res.render('register', {
					pnameTaken: 'Profile name taken.. choose other Profile Name!!',
					emailTaken: ' '
				});
			}
			else
			{
				connection.query('SELECT * FROM users WHERE email = ?',[email], function(error, results, fields)
				{
					if(error){
						console.log("error at query");
						res.send({
							"code":400,
							"failed":"Error ocurred"
						});
					}
					else
					{
						if(results.length > 0)
						{
							console.log("USER EXISTS");
							res.render('register', {
								pnameTaken: ' ',
								emailTaken: 'Email already registered'
							});
						}
						else
						{
							connection.query("INSERT INTO users values ('"+fname+"','"+lname+"','"+pname+"','"+gender+"','"+email+"','"+password+"','"+description+"','"+DOB+"','"+religion+"','"+motherTongue+"','"+userHeight+"','"+mStatus+"','"+privacy+"','"+qualification+"','"+college+"','"+occupation+"','"+country+"','"+salary+"')",function(error, results, fields)
							{
								if(error)
								{
									console.log("error at inserting values");
									res.send({
										"code":400,
										"failed":"Error ocurred"
									});
								}
								else
								{
									console.log("Register Successful");
									console.log(pname+" "+email+" "+password);
									//res.sendFile(__dirname+"/login.html");
									res.redirect('/login');
									res.end();
								}
							});
						}
					}		
				});				
			}
		}
	});
})

app.get('/logout', function(req, res) {
  	req.session.destroy(function(err){
  		if(err){
  			console.log(err);
  		}
  		else {
  			res.redirect('/');
  		}
  	});
});

var server = app.listen(8081, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(host+" "+port);
})