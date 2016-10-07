var express = require('express'),
    socketio = require('socket.io'),
    app = express(),
    redis = require('redis'),
    server = app.listen(8080),
    ent = require('ent'),
    io = socketio.listen(server),
    client = redis.createClient();

app.use(express.static('public'));

io.on('connection', function (socket) {
  ///// old messages
  client.lrange('dubois', 0, -1, (err, result) => {
    result.forEach((element) => {
      var elementSplited = element.split('~$@~'),
          pseudo = elementSplited[0],
          message = elementSplited[1];
      socket.emit('sendAllMessages', {pseudo: pseudo, message: message});
    });
  });
  ///// new messages
  socket.on('message', (data) => {
    data.message = ent.encode(data.message);
    socket.emit('message', {pseudo: data.pseudo, message: data.message});
    socket.broadcast.emit('message', {pseudo: data.pseudo, message: data.message});
    client.rpush('dubois', data.pseudo + '~$@~' + data.message);
    client.ltrim('dubois', 0, 399);
  });
});
