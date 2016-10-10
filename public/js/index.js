
var socket = io.connect('http://'+ window.location.hostname +':8080/');
pseudo = prompt('pseudo');

$('#disconnect').html( '<span>' + pseudo + ' ' +'</span><img src="img/cross.png" height="14px" width="14px"/>' );
$('#disconnect').on('click', function() { location.reload(); });


function insereFormatMessage(thisPseudo, message, dateMessage) {
  var forMeOrNot = message.indexOf('@'+ pseudo);
  var important = message.indexOf('@important');
  message = (message).split("&#10;").join('<br/>');
  message = (message).replace(/(http:\S+)/, '<a href="$1">$1</a>');
  message = (message).replace(/(https:\S+)/, '<a href="$1">$1</a>');
  if (forMeOrNot >= 0) {
    $('#zone_chat').append('<p class="message-for-me"><strong class="important">' + thisPseudo + ' (Pour vous) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else if(important >= 0) {
    $('#zone_chat').append('<p class="important"><strong class="important">' + thisPseudo + ' <i class="fa fa-exclamation-triangle" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else if (thisPseudo == pseudo) {
    $('#zone_chat').append('<p class="p-my-user"><strong class="my">' + thisPseudo + ' (Moi-même) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else {
    $('#zone_chat').append('<p class="p-other-users"><strong class="other">' + thisPseudo + ' ' + '<i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  }
  var body = document.getElementById('body');
  body.scrollTop = body.scrollHeight;
}


socket.on('sendAllMessages', function(data) {
  insereFormatMessage(data.pseudo, data.message, data.date);
});
socket.on('message', function(data) {
  insereFormatMessage(data.pseudo, data.message, data.date);
});


$('#formulaire_chat').submit(function () {
  var message = $('#message').val();
  if(message) {
    socket.emit('message', {message: message, pseudo: pseudo});
    $('#message').val('').focus();
    return false;
  }
  $('#message').val('').focus();
  return false;
});


$('#formulaire_login').submit(function () {
  var pseudo = $('#message').val();

});
