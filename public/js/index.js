
var socket = io.connect('http://localhost:8080');
var pseudo = prompt('Quel est votre pseudo ?');
socket.on('message', function(data) {
  insereMessage(data.pseudo, (data.message).split("\n").join('<br/>'));
});


$('#formulaire_chat').submit(function () {
  var message = $('#message').val();
  message = (message).split("\n").join('<br/>');
  message = (message).replace(/(@\S+)/, '<span class="span-target">$1</span>');
  socket.emit('message', {message: message, pseudo: pseudo});
  insereMessage(pseudo, message);
  $('#message').val('').focus();
  return false;
});


function insereMessage(thisPseudo, message) {
  var dateMessage = moment().format(' DD/MM  HH:mm');
  console.log(dateMessage);
  var forMeOrNot = message.indexOf('@'+ pseudo);
  var important = message.indexOf('@important');
  if (forMeOrNot > 0) {
    $('#zone_chat').append('<p class="message-for-me"><strong class="important">' + thisPseudo + ' (Pour vous) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else if(important > 0) {
    $('#zone_chat').append('<p class="important"><strong class="important">' + thisPseudo + ' <i class="fa fa-exclamation-triangle" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else if (thisPseudo == pseudo) {
    $('#zone_chat').append('<p class="p-my-user"><strong class="my">' + thisPseudo + ' (Moi-même) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  } else {
    $('#zone_chat').append('<p class="p-other-users"><strong class="other">' + thisPseudo + ' ' + '<i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
  }
  var body = document.getElementById('body');
  body.scrollTop = body.scrollHeight;
}
