var socket;
socket = io.connect();

var main = document.getElementById('main');
var codeName;
var realName;
var currentConvo;
var convoTime = 180;

startScreen();

function startScreen(){
	//Create elements for start
	var instructions = document.createElement('p');
	instructions.id = 'instructions';
	instructions.innerHTML = "Welcome to CHATGAME&trade;! Please type your real first name and press enter.";
	main.appendChild(instructions);
	var nameInput = document.createElement('input');
	nameInput.id = 'nameInput';
	nameInput.type = 'text';
	main.appendChild(nameInput);
	nameInput.focus();
	nameInput.select();

	socket.on('codeName', getCodeName);

	//Check for name submission
	nameInput.addEventListener('keyup',function(event){
		if (event.keyCode === 13) {
			var data = {
				value : nameInput.value
			}
			realName = nameInput.value;
			socket.emit('realName',data);
			nameInput.value = "";
		}
	});

	function getCodeName(CodeName){
		codeName = CodeName;
		main.removeChild(nameInput);
		instructionScreen();
	}

}

function instructionScreen(){
	var instructions = document.getElementById('instructions');
	var message = "Hello, "+realName+". Your new code name is "+codeName+
	". The other players each have a code name as well. Your objective "+
	"is to discover the real identities of each of the other players, while "+
	"keeping your own identity a secret. You will do this by "+
	"having a conversation with them via instant message. You will be scored "+
	"based on this system:<br><br>1 point for each other player you guess correctly<br>"+
	"1 point for each player who does not guess your identity<br>"+
	"-1 point for being the least talkative player<br><br>"+
	"Each player chooses a conversation topic. You will discuss the topic for 3 minutes.<br>"+
	"Enter in your topic:";
	;
	instructions.innerHTML = message;
	var convoInput = document.createElement('input');
	convoInput.id = 'nameInput';
	convoInput.type = 'text';
	main.appendChild(convoInput);
	convoInput.focus();
	convoInput.select();

	convoInput.addEventListener('keyup',function(event){
		if (event.keyCode === 13) {
			var data = {
				value : convoInput.value
			}
			socket.emit('convo', data);
			main.removeChild(convoInput);
			waitingForPlayers();
		}
	});
}

function waitingForPlayers(){
	var instructions = document.getElementById('instructions');
	instructions.innerHTML = "These are the players so far:<br>";
	var players = document.createElement('h2');
	main.appendChild(players);
	var playerList = [""];
	var buttonInst = document.createElement('p');
	buttonInst.id = 'buttonInst';
	buttonInst.innerHTML = "When all players are listed, press the play button."
	main.appendChild(buttonInst);
	var playButton = document.createElement('button');
	playButton.innerHTML = "PLAY";
	socket.on('play', function(convo){
		currentConvo = convo;
		main.removeChild(players);
		main.removeChild(buttonInst);
		main.removeChild(playButton);
		chat();
	});
	playButton.onclick = function(){
		socket.emit('play');
	};
	main.appendChild(playButton);

	socket.on('players', addToPlayerList);

	function addToPlayerList(PlayerList){
		for(var i = 0; i < PlayerList.length; i++){
			if(playerList.indexOf(PlayerList[i])==-1){
				playerList.push(PlayerList[i]);
				players.innerHTML += PlayerList[i];
				players.innerHTML += '<br>'
			}
		}
	}

}

function chat(){
	//Create elements for chat
	var instructions = document.getElementById('instructions');
	instructions.innerHTML = "Talk about: "+currentConvo;
	var chatLog = document.createElement('div');
	chatLog.id = 'chat';
	main.appendChild(chatLog);
	var inputDiv = document.createElement('div');
	inputDiv.id = 'inputDiv';
	main.appendChild(inputDiv);
	var input = document.createElement('input');
	input.id = 'input';
	input.type = 'text';
	inputDiv.appendChild(input);
	input.focus();
	input.select();

	//Check for new chat logs
	socket.on('input', newInput);
	socket.on('newConvo', function(data){
		currentConvo = data;
		instructions.innerHTML = "Talk about "+currentConvo+" for "+convoTime+" seconds";
	});
	socket.on('time', function(data){
		convoTime = data;
		instructions.innerHTML = "Talk about "+currentConvo+" for "+convoTime+" seconds";

	})
	socket.on('endChat', function(){
		instructions.innerHTML = "Game over";
	});

	//Submit text	
	input.addEventListener('keyup',function(event){
		if (event.keyCode === 13) {
			var data = {
				value : input.value
			}
			socket.emit('input',data);
			input.value = "";
		}
	});

	function newInput(log){
		chatLog.innerHTML += log.id + ": " + log.value + "<br>";
		chatLog.scrollTop = chatLog.scrollHeight;
	}
}

