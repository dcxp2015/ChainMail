var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = 3300;

server.listen(port, function() {
	console.log('Listening on port %d', port);
})

app.use(express.static(__dirname + '/public'));

var numUsers = 0;

io.on('connection', function(socket) {
	var addedUser = false;

	// Load all previous messages
	// Loop through database and display messages to single client
	// not entirely sure how to do single client... so gonna have to wait on this part

	socket.on('new message', function(data) {
		// Add to the database
		// username will be socket.username
		// message will be data
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});

	socket.on('add user', function(username) {
		socket.username = username
		// Check if username is in the database
		// If already in list send some sort of broadcast (not sure what yet...)
		// Else, add user to database
		addedUser = true;
		numUsers = numUsers + 1;

		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});
	});

	socket.on('disconnect', function() {
		if(addedUser){
			// delete username from database
			numUsers = numUsers - 1;

			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
});
