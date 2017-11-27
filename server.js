var socketio = require('socket.io');
var express	=	require('express');
var	session	=	require('express-session');
var app	=	express();
var server = app.listen(3000);
var io = socketio.listen(server);
var	bodyParser = require('body-parser');
var ent = require('ent');
var moment = require('moment');
var redis = require('redis');
var client = redis.createClient('6379', 'redis');


app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);


app.use(session({secret: ' ', saveUninitialized: true, resave: true}));
app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


var sess;
app.post('/users',function(req,res){
	client.hgetall('code', (err, result) => {
		res.end(JSON.stringify(result));
	});
});
app.post('/chat',function(req,res){
	sess = req.session;
	sess.user = req.body.user;
	sess.code = req.body.code;
	client.hgetall('code', (err, result) => {
		if (result[sess.user] == sess.code) {
			res.end('done');
		} else {
			res.end('false');
		}
	});
});
app.post('/sess',function(req,res){
	sess = req.session;
	res.end(sess.user);
});
app.post('/mess',function(req,res){
	client.lrange('messages', 0, -1, (err, result) => {
		var allMessage = JSON.stringify(result);
		res.end(allMessage);
  });
});
app.post('/connected',function(req,res){
	client.smembers('clients', (err, result) => {
		var usersConnected = JSON.stringify(result);
		res.end(usersConnected);
	});
});
app.get('/chat',function(req,res){
	sess = req.session;
	if (sess.user) {
		res.render('chat.html');
	}	else {
		res.redirect('/');
	}
});
app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});


io.on('connection', function (socket) {

	socket.on('userConnect', (data) => {
		client.sadd('clients', data.pseudo);
		socket.on('disconnect', function() {
			client.srem('clients', data.pseudo);
    });
	});

  socket.on('message', (data) => {
    var message = ent.encode(data.message);
    var date = moment().format(' DD/MM  HH:mm');
    socket.emit('message', {pseudo: data.pseudo, message: message, date: date});
    socket.broadcast.emit('message', {pseudo: data.pseudo, message: message, date: date});
    client.lpush('messages', data.pseudo + '~$@~' + message + '~$@~' + date);
    client.ltrim('messages', 0, 300);
  });
});
