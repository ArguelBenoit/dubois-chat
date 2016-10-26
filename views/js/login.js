
$(document).ready(function(){
	var user;
	var code;
	var location;
  if (window.location.hostname == 'localhost') {
    location = 'http://'+ window.location.hostname + ':3000';
  } else {
    location = 'http://'+ window.location.hostname; //because in production nginx redirect automaticaly all request on port 3000
  }

	$.post(location +'/users', false, function(data) {
		var userAndCode = JSON.parse(data);
		var users = Object.keys(userAndCode);
		users.sort();
		for(var i = 0; i < users.length; i++) {
			$('#user').append('<option value="'+ users[i] +'">'+ users[i] +'</option>');
		}
	});

	$('#code').keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });

	$('#submit').click(function(){
		user=$('#user').val();
		code=$('#code').val();
		$.post(location +'/chat', { user: user, code: code}, function(data) {
			if(data === 'done') {
				window.location.href = location +'/chat';
			} else if (data === 'false') {
				$('#code').css('border', '2px solid rgba(255,0,0,0.6)');
			}
		});
	});
});
