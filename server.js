// Check the configuration file for more details
var config = require('./config');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
// var app = express();
// var server = app.listen(process.env.OPENSHIFT_NODEJS_PORT || '8080');
var clientIndex = 0;
var clients = [];

// var io = socket(server);
var io = require('socket.io')(server);

console.log("Trying to start server with config:", config.serverip + ":" + config.serverport);

// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
server.listen(config.serverport, config.serverip, function() {
  console.log("Server running @ http://" + config.serverip + ":" + config.serverport);
});

app.use(express.static(__dirname + '/'));
// Server GET on http://domain/api/config
// A hack to provide client the system config
console.log(JSON.stringify(config));
app.get('/api/config', function(req, res) {
  res.send('var config = ' + JSON.stringify(config));
});
// app.use(express.static('public'));
var socket = require('socket.io');



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