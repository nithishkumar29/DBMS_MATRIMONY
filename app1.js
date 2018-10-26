var express = require('express');
var path=require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection ({
	host : 'localhost',
	database : 'matrimony',//'DBMSproject',
	user : 'root',
	password : ''//'root',
});

var dpController=require('./dpController.js');

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  resave:false,
  saveUninitialized:true
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
		username: 'hi',
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
var members=[[]],others=[[]];
app.get('/dashboard',function(req,res) {
	if(req.session.user&&req.session){
		var otherUsers=[[]];
					connection.query('SELECT * FROM users WHERE email != ?',[req.session.user.email],function(err,resultRows,fields){
                              res.render( 'welcome', {
								user: req.session.user,
					            members:resultRows

							});
					});
		
	}
	else{
		console.log('Login again!!');
		res.redirect('/');
	}
})

app.post('/login',urlencodedParser,function(req,res){
	var	email = req.body.userEmail;
	var	password = req.body.userPassword;
	
	connection.query('SELECT * FROM users WHERE email = ?',[email],function(error, results, fields){
		if(error){
			console.log("error");
			res.redirect('/');
		}
		else{
			if(results.length > 0){
				if(results[0].pass==password){
					var newUser = {
						fname:results[0].fname, 
						lname:results[0].lname, 
						pname:results[0].pname,
						gender:results[0].gender,
						description:results[0].about,
						DOB:results[0].dob,
						religion:results[0].religion,
						motherTongue:results[0].motherTongue,
						userHeight:results[0].height,
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
					console.log("Login Successful");
					res.redirect('/dashboard');
				}
				else{
					console.log("Password Incorrect");
					res.render( 'start', {
						passwordIncorrect: 'password Incorrect',
						userNotRegistered: ' '
					});
				}
			}
			else{
				console.log("Email Doesn't exist");
				res.render( 'start', {
					userNotRegistered: 'User Not Registered',
					passwordIncorrect: ' '
				});
			}
		}
	});
});



app.post('/signup',urlencodedParser,function(req,res){
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
		else{
			if(results.length > 0)
			{
				console.log("USER EXISTS");
				res.redirect('/');
			}
			else{
 
				connection.query("INSERT INTO users (fname,lname,pname,gender,email,pass,about,dob,religion,motherTongue,height,mStatus,privacy,qualification,college,occupation,country,salary) values ('"+fname+"','"+lname+"','"+pname+"','"+gender+"','"+email+"','"+password+"','"+description+"','"+DOB+"','"+religion+"','"+motherTongue+"','"+userHeight+"','"+mStatus+"','"+privacy+"','"+qualification+"','"+college+"','"+occupation+"','"+country+"','"+salary+"')",function(error, results, fields)
				{
					if(error){
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
						res.redirect('/');
						res.end();
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

dpController(app);
var server = app.listen(8081, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(host+" "+port);
})