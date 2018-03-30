
var express = require('express');
var app = express();
var server = app.listen(3000);
var clientIndex = 0;
var clients = [];

app.use(express.static('public'));

console.log("My socket server is running");

var socket = require('socket.io');

var io = socket(server);

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