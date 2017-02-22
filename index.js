var io = require('socket.io')();

console.log("Registering listeners...");
io.on('connection', function(client){
    console.log("Someone connected!");
	client.on("scorebord", function(data) {
		console.log(data)
	});
});

const items =  ["#F44336", "#E91E63", "#9C27B0"];
const players = ["henk", "jan", "stan", "brandon", "nick", "geoffrey"];

setInterval(function () {
    var item = items[Math.floor(Math.random() * items.length)];
    var name = players[Math.floor(Math.random() * players.length)];

    io.emit("newplayer", {
        score: "0",
        color: item,
	    name: name,
    });
}, 1000);

console.log("Now listening on *:3000");
io.listen(3000);
