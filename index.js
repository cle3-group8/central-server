var io = require('socket.io')();

console.log("Registering listeners...");
io.on('connection', function(client){
    console.log("Someone connected!");
	client.on("scorebord", function(data) {
		console.log(data)
	});
});

const items =  ["#F44336", "#E91E63", "#9C27B0"];

setInterval(function () {
    var item = items[Math.floor(Math.random() * items.length)];
    io.emit("newplayer", {
        score: "0",
        color: item,
	name: "Henk",
    });
}, 1000);

console.log("Now listening on *:3000");
io.listen(3000);
