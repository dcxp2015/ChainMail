// var express = require('express');
// var app = express()
// 		, server = require('http').createServer(app)
// 		, io = io.listen(server);
// // var server = require('http').createServer(app);
// // var io = require('socket.io').listen(server);

// server.listen(3306);
// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// app.use(express.static(__dirname + '/public'));
// var express = require('express')
//   , app = express()
//   , http = require('http')
//   , server = http.Server(app)
//   , io = require('socket.io').listen(server)

var express = require('express');
var app = express();
var server = app.listen(3006);

var io = require('socket.io').listen(server);




app.use(express.static(__dirname + '/public'));
// var express = require('express');
// var http = require('http');
// var app = express();
// var server = http.createServer(app);


// server.listen(3006, 'localhost');


var port = 3006;

var mysql = require("mysql");
var db = mysql.createConnection({	//temp code
  host     : 'localhost',
  database : 'ChainMail',
  user     : 'root',
  password : 'pm shicheng for password'

});
 
function js_yyyy_mm_dd_hh_mm_ss () {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}


server.listen(port, function() {
	console.log('Listening on port %d', port);
	db.connect(function(err){
		if(err){
			console.log("ERROR:" + err.message);
		}
		else{
			console.log("Database connected successfully");
			db.query("SELECT * FROM messages", function(err, results){
				if(err){
					console.log("ERROR:" + err.message);
				}
				else{
					console.log("messages");
					console.log(results);
				}
			});
		}
	});

})

console.log("next");
// var io = require('socket.io')(server);
//app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/chat');
// });

// app.use(express.static(__dirname + '/index.html'));
app.get('/', function (req, res) {
  res.sendFile(__dirname +'/index.html');
});

var numUsers = 0;
var canJoin = false;

io.on('connection', function(socket) {
	console.log("hello");

	var id = socket.id;
	console.log(id);
	console.log(io.engine.clients);

	var addedUser = false;

	db.query("SELECT * FROM messages", function(err, results){
		if(err){
			console.log("ERROR:" + err.message);
		}
		else{
			console.log(results);
			// for(var i = 0; i < results.length; i++){
			// 	for(key in results[i]){
			// 		socket.broadcast.emit('new message', {
			// 			username: socket.username,
			// 			message: data
			//			
			// 		});
			// 	}
			// }
			// console.log(results);
			//sends all messages through websocket 
		}
	});


	socket.on('new message', function(data) {
		var currTime = js_yyyy_mm_dd_hh_mm_ss();
		var message = data;
		var image = null;

		console.log(message);

		db.query("INSERT INTO messages SET username = ?, time = ?, msg = ?, image = ?", [socket.username, currTime, message, image], function(err, results){
			if(err){
				console.log("ERROR:" + err.message);
			}
			else{
				socket.broadcast.emit('new message', {
					username: socket.username,
					message: data
				});
			}
		});


	});

	socket.on('add user', function(username) {
		socket.username = username;
		console.log(username);

		db.query("SELECT COUNT(*) FROM current_users", function(err, results){
			if(err){
				console.log("ERROR:" + err.message);
			}
			else if(results[0]["COUNT(*)"] > 9){
				console.log("too many users");				///send message through websocket
			}
			else{
				db.query("SELECT * FROM current_users WHERE username = ?", socket.username, function(error, result){
					if(error){
						console.log("ERROR:" + error.message);
					}
					else if(result.length > 0){
						console.log("user already exists");		//send message through websocket
					}
					else{
						db.query("INSERT INTO current_users SET username =?", socket.username, function(err, results){
							if(err){
								console.log("ERROR:" + err.message);
							}
							else{
								console.log("added current user");
								addedUser = true;
								numUsers = numUsers + 1;
								socket.emit('user joined', {
									username: socket.username,
									numUsers: numUsers,
									canJoin: true
								});




								//go to next page
							}

							db.query("SELECT * FROM messages", function(err, results){
								if(err){
									console.log("ERROR:" + err.message);
								}
								else{
									console.log(results);
									console.log('zzz');
									for(var i = 0; i < results.length; i++){
										io.to(id).emit('new message', {
											username: results[i].username,
											message: results[i].msg
										})
									}
								}
							});
						});
					}
				});
			}
		});


	});

	socket.on('disconnect', function() {
		if(addedUser){
			 db.query("DELETE FROM current_users WHERE username = ?", socket.username, function(err, results){
			 	if(err){
			 		console.log("ERROR:" + err.message);
			 		throw err;
			 	}
			 	else{
			 		console.log('deletedUser');
			 	}
			 });

			numUsers = numUsers - 1;

			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
});