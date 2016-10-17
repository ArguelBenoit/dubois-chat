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
var client = redis.createClient();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh', saveUninitialized: true, resave: true}));
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
app.get('/chat',function(req,res){
	sess = req.session;
	if (sess.user) {
		res.render('chat.html');
	}	else {
		res.render('index.html');
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

io.on('connection', function (socket) { ///// all users
  client.hgetall('code', (err, result) => {
    socket.emit('users', result);
  });
  client.lrange('messages', 0, -1, (err, result) => { ///// old messages
    result.forEach((element) => {
      var elementSplited = element.split('~$@~'),
          pseudo = elementSplited[0],
          message = elementSplited[1],
          date = elementSplited[2];
      socket.emit('sendAllMessages', {pseudo: pseudo, message: message, date: date});
    });
  });
  socket.on('message', (data) => { ///// new messages
    var message = ent.encode(data.message);
    var date = moment().format(' DD/MM  HH:mm');
    socket.emit('message', {pseudo: data.pseudo, message: message, date: date});
    socket.broadcast.emit('message', {pseudo: data.pseudo, message: message, date: date});
    client.rpush('messages', data.pseudo + '~$@~' + message + '~$@~' + date);
    client.ltrim('messages', 0, 399);
  });
});
