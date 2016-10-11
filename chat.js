var express = require('express'),
    socketio = require('socket.io'),
    app = express(),
    redis = require('redis'),
    server = app.listen(8080),
    ent = require('ent'),
    moment = require('moment'),
    io = socketio.listen(server),
    client = redis.createClient();

app.use(express.static('public'));

io.on('connection', function (socket) {
  ///// all users for <form-login>
  client.hgetall('code', (err, result) => {
    socket.emit('users', result);
  });
  ///// old messages
  client.lrange('messages', 0, -1, (err, result) => {
    result.forEach((element) => {
      var elementSplited = element.split('~$@~'),
          pseudo = elementSplited[0],
          message = elementSplited[1],
          date = elementSplited[2];
      socket.emit('sendAllMessages', {pseudo: pseudo, message: message, date: date});
    });
  });
  ///// new messages
  socket.on('message', (data) => {
    var message = ent.encode(data.message);
    var date = moment().format(' DD/MM  HH:mm');
    socket.emit('message', {pseudo: data.pseudo, message: message, date: date});
    socket.broadcast.emit('message', {pseudo: data.pseudo, message: message, date: date});
    client.rpush('messages', data.pseudo + '~$@~' + message + '~$@~' + date);
    client.ltrim('messages', 0, 399);

  });
});
