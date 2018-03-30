var socket;
var chat;
var input;

socket = io.connect('http://chatgame-chatgame.a3c1.starter-us-west-1.openshiftapps.com:8080');
socket.on('input', newInput);
chat = document.getElementById("chat");
input = document.getElementById("input");
input.focus();
input.select();


function newInput(log){
	chat.innerHTML += log.id + ": " + log.value + "<br>";
	chat.scrollTop = chat.scrollHeight;
}

input.addEventListener('keyup',function(event){
	if (event.keyCode === 13) {
		var data = {
			value : input.value
		}
		socket.emit('input',data);
		input.value = "";
	}
});