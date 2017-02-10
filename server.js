
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
