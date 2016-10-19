
$(document).ready(function(){
	var user;
	var code;
	$.get('http://'+ window.location.hostname +':3000/users', false, function(data) {
		var userAndCode = JSON.parse(data);
		var users = Object.keys(userAndCode);
		users.sort();
		for(var i = 0; i < users.length; i++) {
			$('#user').append('<option value="'+ users[i] +'">'+ users[i] +'</option>');
		}
	});
	$("#submit").click(function(){
		user=$('#user').val();
		code=$('#code').val();
		$.post('/chat', { user: user, code: code}, function(data) {
			if(data === 'done') {
				window.location.href='http://'+ window.location.hostname +':3000/chat';
			} else if (data === 'false') {
				$('#code').css('border-color', 'rgba(255,0,0,0.6)');
			}
		});
	});
});
