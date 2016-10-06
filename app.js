var express = require('express'),
    socketio = require('socket.io'),
    app = express(),
    redis = require('redis'),
    server = app.listen(8080),
    io = socketio.listen(server);

app.use(express.static('public'));

io.on('connection', function (socket) {
  socket.on('message', function (data) {
    socket.broadcast.emit('message', {pseudo: data.pseudo, message: data.message});
  });
});
