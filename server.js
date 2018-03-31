var clientIndex = 0;
var clients = [];
// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(8000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

io.sockets.on('connection', newConnection);


function newConnection(socket){
	var index = clientIndex;

	clients.push({"id":socket.id,"index":clientIndex});
	clientIndex ++;
	console.log('New connection: '+socket.id+" Client count: "+io.engine.clientsCount);
	socket.on('input',input);
	function input(data){
		var log  = {
			id : index,
			value : data.value
		}
		io.sockets.emit('input',log);
	}
	socket.on('disconnect', function(){
		console.log("lost connection");
		var log = {
			id : "ALERT",
			value : index+" has left"
		}
		io.sockets.emit('input',log);
	});
}

// socket.broadcast.emit('mouse',data); //Only to other clients
//io.sockets.emit('mouse',data);