
$(document).ready(function(){
  var pseudoCourant;
  var location = 'http://' + window.location.hostname;
  var socket = io.connect(location);

  /*_____________________________________________________________________*/

  function spawnNotification(theBody, theIcon, theTitle) {
    var options = {
      body: theBody,
      icon: theIcon,
      lang:'fr-FR'
    };
    var n = new Notification(theTitle, options);
    n.lang;
    n.onclick = function(){
      window.focus();
      this.cancel();
    };
    setTimeout(n.close.bind(n), 60000);
  }
  function notify(pseudo, message) {
    if (Notification.permission === 'granted') {
      spawnNotification(message, '../img/feather100x100.png', pseudo + ' a écrit : ');
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if(!('permission' in Notification)) {
          Notification.permission = permission;
        } if (permission === 'granted') {
          spawnNotification(message, '../img/feather80x80.png', pseudo + ' a écrit : ');
        }
      });
    }
  }
  function goToBottom(){
    $('html,body').animate({scrollTop: $('body').height() }, 300);
    return false;
  };
  function insereFormatMessage(thisPseudo, message, dateMessage, pseudo, appendOrPrepend) {
    var forMeOrNot = message.indexOf('@'+ pseudo);
    var important = message.indexOf('@important');
    message = (message).split("&#10;").join('<br/>');
    message = (message).replace(/(http:\S+)/, '<a href="$1">$1</a>');
    message = (message).replace(/(https:\S+)/, '<a href="$1">$1</a>');
    if(appendOrPrepend == 'append') {
      if (forMeOrNot >= 0) {
        $('#zone_chat').append('<p class="message-for-me"><strong class="important">' + thisPseudo + ' (Pour vous) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else if(important >= 0) {
        $('#zone_chat').append('<p class="important"><strong class="important">' + thisPseudo + ' <i class="fa fa-exclamation-triangle" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else if (thisPseudo == pseudo) {
        $('#zone_chat').append('<p class="p-my-user"><strong class="my">' + thisPseudo + ' (Moi-même) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else {
        $('#zone_chat').append('<p class="p-other-users"><strong class="other">' + thisPseudo + ' ' + '<i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      }
    } else if (appendOrPrepend == 'prepend') {
      if (forMeOrNot >= 0) {
        $('#zone_chat').prepend('<p class="message-for-me"><strong class="important">' + thisPseudo + ' (Pour vous) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else if(important >= 0) {
        $('#zone_chat').prepend('<p class="important"><strong class="important">' + thisPseudo + ' <i class="fa fa-exclamation-triangle" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else if (thisPseudo == pseudo) {
        $('#zone_chat').prepend('<p class="p-my-user"><strong class="my">' + thisPseudo + ' (Moi-même) <i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      } else {
        $('#zone_chat').prepend('<p class="p-other-users"><strong class="other">' + thisPseudo + ' ' + '<i class="fa fa-comment-o" aria-hidden="true"></i></strong></br>' + message + '<span class="date"> ' + dateMessage + '</span></p>');
      }
    }
  }
  /*_____________________________________________________________________*/

  var allUsers = [];
  $.post(location +'/users', false, function(data) {
		var userAndCode = JSON.parse(data);
		var users = Object.keys(userAndCode);
		users.sort();
    users.forEach(function(element) {
      allUsers.push(element);
    });
	});
  $('#all-users').click(function() {
    $('#list-users-ul').html(' ');
    $.post(location + '/connected', false, function(a) {
      var allConnected = JSON.parse(a);
      allConnected.sort();
      $('#list-users-ul').append('<li class="legend">'+ (allConnected.length) +' utilisateurs connectés</li>');
      allConnected.forEach(function(element) {
        $('#list-users-ul').append('<li class="connected '+ element.replace(" ", "_") +'"><span style="padding-left: 7px;"class="connected-status"><i class="fa fa-plug" aria-hidden="true"></i></span><span style="padding-left: 5px;">' + element + '</span></li>');
      });
      allUsers.forEach(function(element){
        if (allConnected.indexOf(element) == -1)
          $('#list-users-ul').append('<li class="'+ element.replace(" ", "_") +'"><span style="padding-left: 7px;"class="connected-status"><i class="fa fa-plug" aria-hidden="true"></i></span><span style="padding-left: 5px;">' + element + '</span></li>');
      });
    });
    $('#list-users').css('display', 'initial');
  });
  $('#list-users').click(function() {
    $("#list-users").fadeOut("100");
  });

  /*_____________________________________________________________________*/

  $.post(location +'/sess', false, function(a) {
    if (!a) {
      window.location.replace(location +'/');
    } else {
      $("#cover").fadeOut("1000");
    }
    $('#disconnect').html( '<span>' + a + ' ' +'</span><img src="img/cross.png" height="14px" width="14px"/>' );
    $('#disconnect').on('click', function(){
      window.location.replace(location +'/logout');
    });
    pseudoCourant = a;
    socket.emit('userConnect', {pseudo: a});
    $.post(location + '/mess', false, function(a) {
      var allMessages = JSON.parse(a);
      allMessages.forEach((element) => {
        var elementSplited = element.split('~$@~'),
        pseudo = elementSplited[0],
        message = elementSplited[1],
        date = elementSplited[2];
        insereFormatMessage(pseudo, message, date, pseudoCourant, 'prepend');
      });
      goToBottom();
    });
  });

  socket.on('message', function(data) { // received one message
    insereFormatMessage(data.pseudo, data.message, data.date, pseudoCourant, 'append');
    if(data.pseudo != pseudoCourant) {
      notify(data.pseudo, data.message); // why not add condition (document.visibilityState != 'visible' || document.visibilityState == 'hidden')
    }
    goToBottom();
  });
  $('#formulaire_chat').submit(function () { // send one message
    var message = $('#message').val();
    if(message && pseudoCourant != undefined) {
      socket.emit('message', {message: message, pseudo: pseudoCourant});
      $('#message').val('').focus();
      return false;
    }
    $('#message').val('').focus();
    return false;
  });
});
