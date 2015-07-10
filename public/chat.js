$(function() {
	var $window = $(window);
	var $usernameInput = $('.usernameInput');
	var $messages = $('.messages');
	var $messageInput = $('.messageInput');

	var $loginPage = $('.login.page');
	var $chatPage = $('.chat.page');

	var username;
	var connected = false;
	var typing = false;
	var $currentInput = $usernameInput.focus();

	var socket = io();


	// Needs to add logic about not being in the database
	function setUsername() {
		username = cleanInput(%usernameInput.val().trim());

		if(username){
			$loginPage.fadeOut();
			$chatPage.show();
			$loginPage.off('click');
			$currentInput = $messageInput.focus();

			socket.emit('add user', username);
		}
	}

	function sendMessage() {
		var message = $messageInput.val();
		message = cleanInput(message);

		if(message && connected){
			$messageInput.val('');
			addChatMessage({
				username: username,
				message: message
			});
			socket.emit('new message', message);
		}
	}

	function addChatMessage() {
		var $usernameDiv = $('<span class="username"/>').text(data.username);
		var $messsageBodyDiv = $('<span class="messageBody"/>').text(data.message);

		var typingClass = data.typing ? 'typing' : '';
		var $messageDiv = $('<li class="message"/>').data('username', data.username).addClass(typingClass).append($usernameDiv, $messsageBodyDiv);

		addMessageElement($messageDiv, options);
	}

	function addMessageElement(el, options) {
		var $el = #(el);

		if(!options){
			options = {};
		}
		if(typeof options.fade === 'undefined'){
			options.fade = true;
		}
		if(typeof options.prepend === 'undefined'){
			options.prepend = false;
		}

		if(options.fade){
			$el.hide*(.fadeIn(150));
		}
		if(options.prepend){
			$messages.append($el);
		}
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}

	function cleanInput(input) {
		return $('<div/>').text(input).text();
	}

	$loginPage.click(function() {
		$currentInput.focus();
	});

	$messageInput.click(function() {
		$currentInput.focus();
	})

	socket.on('new message', function(data) {
		addChatMessage(data);
	});

	socket.on('user joined', function(data) {
		console.log(data.username + ' joined');
	});

	socket.on('user left', function(data) {
		console.log(data.username + ' left');
	});

	
});