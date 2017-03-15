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

/* SCOREBOARD DEMODATA */
setInterval(function () {
    var item = items[i % items.length];

    io.emit("newplayer", {
        score: "0",
        color: item,
	    name: generateName(),
    });

    i++;
}, 5000 + Math.floor(Math.random() * 3000));

var playerId = 10;
var x = 40;
var y = 40;

/* PROJECTIE DEMO DATA */
setInterval(function() {
    var boolX = Math.random() >= 0.4;
    var boolY = Math.random() >= 0.4;

    io.emit("playerMove", [{
        id: playerId,
        color: "#F44336",
        x: boolX ? (x += Math.floor(Math.random() * 5)) : (x -= Math.floor(Math.random() * 5)),
        y: boolY ? (x += Math.floor(Math.random() * 5)) : (x -= Math.floor(Math.random() * 5))
    }]);

    if(x > 500) {
        x = 0; y = 0; ++playerId;
    }
}, 100);

console.log("Now listening on *:3000");
io.listen(3000);
