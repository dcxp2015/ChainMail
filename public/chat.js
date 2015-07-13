// $(function() {
	var $window = $(window);
	var $usernameInput = $('.usernameInput');
	var $messages = $('.messages');
	var $inputMessage = $('.inputMessage');

	var $loginPage = $('.login.page');
	var $chatPage = $('.chat.page');

	var username;
	var connected = false;
	var typing = false;
	var $currentInput = $usernameInput.focus();
	var canJoin = false;
	var socket = io.connect();
	console.log("connected");




	// Needs to add logic about not being in the database
	function setUsername() {
		canJoin = false;
		username = cleanInput($(".usernameInput").val().trim());
		console.log(username);
		socket.emit('add user', username);
		console.log(canJoin);

	}

	function sendMessage() {
		var message = $('.inputMessage').val();

		$('.inputMessage').val('');
		console.log(message);

		message = cleanInput(message);
		console.log('send');

		socket.emit('new message', message);

		$inputMessage.val('');
		addChatMessage({
			username: username,
			message: message
		});

	}

	function addChatMessage(data) {
		$('.messages').append("<li>" + data.username + ": " + data.message + "</li>");
	}

	// function addMessageElement(el, options) {
	// 	var $el = #(el);

	// 	if(!options){
	// 		options = {};
	// 	}
	// 	if(typeof options.fade === 'undefined'){
	// 		options.fade = true;
	// 	}
	// 	if(typeof options.prepend === 'undefined'){
	// 		options.prepend = false;
	// 	}

	// 	if(options.fade){
	// 		$el.hide*(.fadeIn(150));
	// 	}
	// 	if(options.prepend){
	// 		$messages.append($el);
	// 	}
	// 	$messages[0].scrollTop = $messages[0].scrollHeight;
	// }

	function cleanInput(input) {
		return $('<div/>').text(input).text();
	}

	$loginPage.click(function() {
		$currentInput.focus();
	});

	$inputMessage.click(function() {
		$currentInput.focus();
	})

	socket.on('new message', function(data) {
		addChatMessage(data);
	});

	socket.on('user joined', function(data) {
		console.log(data.username + ' joined');
		canJoin = data.canJoin;
		console.log(canJoin);


		if(canJoin){
			$('.login.page').fadeOut();
			$('.chat.page').show();
			$('.login.page').off('click');
			$currentInput = $inputMessage.focus();
			console.log("joined");
		}




	});

	socket.on('user left', function(data) {
		console.log(data.username + ' left');
	});

	
// });