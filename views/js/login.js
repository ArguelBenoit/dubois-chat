
$(document).ready(function(){
	var user;
	var code;

	$.post('http://'+ window.location.hostname +'/users', false, function(data) {
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
		$.post('http://'+ window.location.hostname +'/chat', { user: user, code: code}, function(data) {
			if(data === 'done') {
				window.location.href = 'http://'+ window.location.hostname +'/chat';
			} else if (data === 'false') {
				$('#code').css('border', '2px solid rgba(255,0,0,0.6)');
			}
		});
	});
});
