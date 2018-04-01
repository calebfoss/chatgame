var clientIndex = 0;
var clients = [];
var PlayerList = [];
var ConvoList = [];
var convoTime;
var convoIndex = 0;

var express = require('express');
// Create the app
var app = express();

var server = app.listen(8080, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
// var io = require('socket.io')(server);
// io.set('transports', ['websocket']);

io.sockets.on('connection', newConnection);


function newConnection(socket){
	var codeName = Math.floor(Math.random()*100);
	var realName;
	var convo;

	clients.push({"id":socket.id,"index":clientIndex});
	clientIndex ++;
	console.log('New connection: '+socket.id+" Client count: "+io.engine.clientsCount);
	socket.on('input',input);
	socket.on('realName',getRealName);
	socket.on('convo', getConvo);
	socket.on('play', startPlay);
	function input(data){
		var log  = {
			id : codeName,
			value : data.value
		}
		io.sockets.emit('input',log);
	}
	function getRealName(data){
		realName = data.value;
		console.log(realName);
		socket.emit('codeName', codeName);
	}
	function getConvo(data){
		convo = data.value;
		ConvoList.push(convo);
		PlayerList.push(realName);
		io.sockets.emit('players', PlayerList);
	}
	function startPlay(){
		shuffle(ConvoList);
		io.sockets.emit('play', ConvoList[0]);
		convoTime = 180;
		console.log(ConvoList);
		sendTime();
	}
	function sendTime(){
		io.sockets.emit('time',convoTime);
		convoTime -= 1;
		if(convoTime > 0){
			setTimeout(function(){sendTime();}, 1000);
		}
		else{
			console.log(convoIndex);
			console.log(ConvoList);
			convoIndex++;
			if(convoIndex < ConvoList.length){
				io.sockets.emit('newConvo', ConvoList[convoIndex]);
				convoTime = 180;
				setTimeout(sendTime, 1000);
			}
			else{
				io.sockets.emit('endChat');
				PlayerList = [];
				ConvoList = [];
				convoIndex = 0;
			}
		}
		
	}
	socket.on('disconnect', function(){
		console.log("lost connection");
		var log = {
			id : "ALERT",
			value : codeName+" has left"
		}
		io.sockets.emit('input',log);
		ConvoList.splice(PlayerList.indexOf(realName),1);
		PlayerList.splice(PlayerList.indexOf(realName),1);
	});
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

// socket.broadcast.emit('mouse',data); //Only to other clients
//io.sockets.emit('mouse',data);