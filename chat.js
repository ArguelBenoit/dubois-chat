var express = require('express');
var socketio = require('socket.io');
var app = express();
var redis = require('redis');
var server = app.listen(8080);
var ent = require('ent');
var moment = require('moment');
var io = socketio.listen(server);
var client = redis.createClient();
app.use(express.static('public'));


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
