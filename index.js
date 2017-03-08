const io = require('socket.io')();
const generateName = require('sillyname');

console.log("Registering listeners...");
io.on('connection', function(client){
    console.log("Someone connected!");

    client.on("playerid", function(data) {
        let id = data.playerNumber;

        setTimeout(function () {
            client.emit("deadplayer", {
                "player": id
            });
        }, 10000 + Math.floor(Math.random() * 15000));
    });

	client.on("scorebord", function(data) {
		console.log(data)
	});
});

const items =  ["#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
    "#8BC34A", "#FFEB3B", "#FFC107", "#FF5722"];

var i = 0;

setInterval(function () {
    var item = items[i % items.length];

    io.emit("newplayer", {
        score: "0",
        color: item,
	    name: generateName(),
    });

    console.log(item);

    i++;
}, 10000 + Math.floor(Math.random() * 15000));

console.log("Now listening on *:3000");
io.listen(3000);
