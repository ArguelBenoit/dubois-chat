var express = require('express'),
    socketio = require('socket.io'),
    app = express(),
    server = app.listen(8080),
    io = socketio.listen(server);

app.use(express.static('public'));

io.on('connection', function (socket) {
  socket.on('message', function (message) {
    socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
  });
});
