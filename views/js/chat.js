var socket = io.connect('http://'+ window.location.hostname +':3000/');

function insereFormatMessage(thisPseudo, message, dateMessage, pseudo) {
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
  document.getElementById('body').scrollTop = document.getElementById('body').scrollHeight;
}

/*___________________________________________________*/

$(document).ready(function(){
  $.post("http://localhost:3000/sess", false, function(pseudo) {
    $('#disconnect').html( '<span>' + pseudo + ' ' +'</span><img src="img/cross.png" height="14px" width="14px"/>' );
    $('#disconnect').on('click', function(){window.location.replace('http://'+ window.location.hostname +':3000/logout');});

    socket.on('sendAllMessages', function(data) { /// all messages
      insereFormatMessage(data.pseudo, data.message, data.date, pseudo);
    });
    socket.on('message', function(data) { /// received one message
      insereFormatMessage(data.pseudo, data.message, data.date, pseudo);
    });
    $('#formulaire_chat').submit(function () { /// send one message
      var message = $('#message').val();
      if(message && pseudo != undefined) {
        socket.emit('message', {message: message, pseudo: pseudo});
        $('#message').val('').focus();
        return false;
      }
      $('#message').val('').focus();
      return false;
    });
  });
});
