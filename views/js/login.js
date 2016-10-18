$(document).ready(function(){
	var user;
	var code;
	$.post("http://localhost/users", false, function(data) {
		var userAndCode = JSON.parse(data);
		var users = Object.keys(userAndCode);
		users.sort();
		for(var i = 0; i < users.length; i++) {
			$('#user').append('<option value="'+ users[i] +'">'+ users[i] +'</option>');
		}
	});
	$("#submit").click(function(){
		user=$("#user").val();
		code=$("#code").val();
		$.post("http://localhost/chat", { user: user, code: code}, function(data) {
			if(data === 'done') {
				window.location.href="/chat";
			} else if (data === 'false') {
				$('#code').css('border-color', 'rgba(255,0,0,0.6)');
			}
		});
	});
});
