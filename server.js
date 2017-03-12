// var serverPort = 43543;
// server side
// Import
var apiai = require("apiai");

var app_apiai = apiai("d610ea89212f4c969fcb25f2dc7ab882");

var options = {
    sessionId: 'jbkqfbebwf3'
};

//bluemix initialization
var serverPort = (process.env.VCAP_APP_PORT || 3000);//process.env finds the port for bluemix. we || it so that if we're not on bluemix, we can run locally on laptop
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');//same with host

//express init
var express = require('express'), app = express();

var http = require('http')//for node js to connect to internets
  , server = http.createServer(app)//creates actual server
  , io = require('socket.io').listen(server);
var jade = require('jade');//support for jade
//var html = require('html');//support for html
var nameArray = [];	// contain all name of user in the room
var users = 0; //number of connected users
var rooms = 0;
// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

server.listen(serverPort, host, function() {
	// print a message when the server starts listening
  console.log("server starting on " + host + ":" + serverPort);
});//creating actual server


//to include the database.js code into server.js
//every function/variable from database.js will be accessed as db.func() or db.var
var db = require('./database.js');



function getMsg(name, text)
{
	var message = {name: name, message: text};
	console.log("name = " + name + "\t\ntext = " + text);
	io.sockets.emit('message', message);
}

function getRooms(str, rooms)
{
	if(str == "success")
	{
		//load rooms
		for(var i = 0; i < rooms.length; i++)
		{
			console.log("found room:");
			console.log(rooms[i]);
		}
		for(var room_ID in rooms[0])
		{
			db.enterChatroom(room_ID, getMsg);
		}
	}
	else
	{
		console.log(str);
	}
}

//sign up = adds user to userbase if user already not in database
//arguments are (username, password)
//db.signup("Charlie", "ilikepie");
//db.signup("Tarang", "ilikepie2");
//db.signup("Jun Ming", "noilikepie");
//signin = checks if username and password match. if so, returns an array of rooms the user is in
//arguments are (username, password)
//db.signup("Charlie", "ilikepie");
//db.signin("Charlie", "ilikepie", getRooms);

//createChatroom = adds a new room to the roomList. Also adds the ID of the room to the user's roomlist
//arguments are (username, name_of_room)
//db.createChatroom("Charlie", "CS252");
//var addTheseUsers = ["Tarang", "Jun Ming", "Charlie"];

//db.enterChatroom({room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"}, getMsg);
//db.addUsersToChatroom(addTheseUsers, {room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"});
//db.sendMessage("Jun Ming", "no", {room_ID: "-KFwxfEIgyC_z6omvB0P", name_of_room: "CS Majors Only"});
//db.test();//test function
//////////////////////////////////////////////////////////////////////////////////

app.set('views', __dirname + '/public');//view = front end

app.set('view engine', 'jade');

app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));//Express helps serve files

// Render and send the main page
//does magical mapping
app.get('/', function(req, res){
  res.render('home.jade');
  //res.render('index.html');
});

app.get('/settings', function(req, res){
  res.render('settings.jade');
  //res.render('settings.html');
});

//actual socket stuff
io.sockets.on('connection', function (socket) {
    // new connection
	socket.on('message', function (data) { // Broadcast the message
		
		console.log(data);
        if (data.indexOf('@stockbot') > -1) {
          // make sure this is not an old message
          console.log("Inform stock bot");

          var ask_bot = data.substr(data.indexOf('@stockbot'), data.length);

          var request = app_apiai.textRequest(ask_bot, options);

          request.on('response', function(response) {
	          console.log(response);
	          var bot_response = response.result.fulfillment.displayText;
	          // console.log(bot_response)
	          var transmit2 = {name : "stockbot", message : bot_response};
	          // io.sockets.emit('message', transmit2);
	          io.sockets.in(socket.room).emit('message', transmit2);
          });
          request.on('error', function(error) {
              console.log(error);
          });
          request.end();
        } else {
          console.log("do not inform stock bot");
        }

        var transmit = {name : socket.nickname, message : data};
		// io.sockets.emit('message', transmit);
	    io.sockets.in(socket.room).emit('message', transmit);

		console.log("user "+ transmit['name'] +" said \""+data+"\"");
	});


	socket.on('enteredRoom', function(data) {
		var transmit = {name : socket.nickname, message : data};
		socket.broadcast.emit('message', transmit);
		console.log("user entered room");
	});

	socket.on("typing", function(data) {
		// console.log(data);
   		io.sockets.emit("isTyping", {isTyping: data.isTyping, person: data.person});
	});

	socket.on('setName', function (data) { // Assign a name to the user

	});

  socket.on('setRoom', function (data) { // Assign a name to the user

	});

	socket.on('setUser', function (data) {
		// DB
		console.log("in socket.on: " + socket.nickname);
		if(data['isSignIn']) {
			// sign in
			db.signin(data['username'], data['password'], function(str, room)
				{
					if(str == "success") {
						getRooms(str, room);
						if (nameArray.indexOf(data['username']) == -1) // Test if the name is already taken
						{
							name = data['username'];
							nameArray.push(data['username']);
							socket.nickname = data['username'];
							// assign room to user, room1 is default

							socket.room = 'room1';
							socket.join('room1');
							socket.emit('message', 'SERVER', 'you have connected to room1');
							socket.broadcast.to('room1').emit('message', 'SERVER', name + ' has connected to this room');
							socket.emit('nameStatus', 'ok');

							// will send event to frontend to change the users room
							socket.emit('message', rooms, 'room1');
							users += 1; // only increment when name is not taken
							reloadUsers();
							reloadUsersName();
						}
						else
						{
							socket.emit('nameStatus', 'error') // Send the error
						}

						reloadUsersName();
					}
					else
						socket.emit("nameStatus", "wrongPassword");
				});
		}
		else {
			// sign up
			db.signup(data['username'], data['password'], function(username, password, bool)
				{
					if(bool){
						db.signin(data['username'], data['password'], getRooms);
						if (nameArray.indexOf(data['username']) == -1) // Test if the name is already taken
						{
							name = data['username'];
							nameArray.push(data['username']);
							socket.nickname = data['username'];
							socket.emit('nameStatus', 'ok');
							users += 1; // only increment when name is not taken
							reloadUsers();
							reloadUsersName();
						}
						else
						{
							socket.emit('nameStatus', 'error') // Send the error
						}
						reloadUsersName();
					}
					else
						socket.emit('nameStatus', 'error');
				});
		}
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('message', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('message', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('message', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	socket.on('disconnect', function () { // Disconnection of the client
		// sent by socket io automatically
		console.log("Disconnection");
		name = socket.nickname;
		var index = nameArray.indexOf(name);

		if(index != -1) { // make sure the name exists
			nameArray.splice(index, 1);
			users -= 1;
			reloadUsers();
			reloadUsersName();
			socket.leave(socket.room);
		}

	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}

function reloadRooms() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": rooms});
}

function reloadUsersName() {
	io.sockets.emit('usersInRoom', {"un": nameArray});
}
