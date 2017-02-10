
var cfenv = require('cfenv');
var serverPort = (process.env.VCAP_APP_PORT || 3000);//process.env finds the port for bluemix. we || it so that if we're not on bluemix, we can run locally on laptop
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');//same with host

//express init
var express = require('express'), app = express();

var http = require('http')//for node js to connect to internets
  , server = http.createServer(app)//creates actual server
  , io = require('socket.io').listen(server)//uses socket.io library
var jade = require('jade');//support for jade
var nameArray = [];	// contain all name of user in the room
var users = 0; //number of connected users

server.listen(serverPort, host, function() {
	// print a message when the server starts listening
  console.log("server starting on " + host + ":" + serverPort);
});//creating actual server
var db = require('./database.js');

function getMsg(name, text, emotion)
{
	var message = {name: name, message: text};
	var emoticon = {name: name, emotion: emotion["emotion"]};
// 	console.log("name = " + name + "\t\ntext = " + text + "\t\nemotion = " + emotion);
// 	io.sockets.emit('message', message);
// 	io.sockets.emit('emotion', emoticon);
// }

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
		// for(var room_ID in rooms[0])
		// {
		// 	db.enterChatroom(room_ID, getMsg);
		// }
	}
	else
	{
		console.log(str);
	}
}

app.set('views', __dirname + '/public');//view = front end
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.use(express.static(__dirname + '/public'));//Express helps serve files

// Render and send the main page
//does magical mapping
app.get('/', function(req, res){
  res.render('home.jade');
});


app.get('/settings', function(req, res){
  res.render('settings.jade');
});

