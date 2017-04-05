const io = require('socket.io')();
const generateName = require('sillyname');
const items =  ["#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
    "#8BC34A", "#FFEB3B", "#FFC107", "#FF5722"];

var pcount = 0;
var players = {};

function calculateDistance(obj1, obj2) {
    let a = Math.pow((obj1.x - obj1.x), 2);
    let b = Math.pow((obj1.y - obj2.y), 2);

    return Math.sqrt(a + b)
}

function createPlayer(x, y, id) {

    var item = items[id % items.length];

    let p = {
        id: id,
        score: "0",
        color: item,
        iterations: 0,
        history: [],
	    name: generateName(),
        x: x,
        y: y
    }

    return p;
}

function coordEquals(a, b) {
    return a.x == b.x && a.y == b.y;
}

function logPlayers() {
    var cleanObjects = [];

    for (p of players) {
        cleanObjects.push({
            id: p.id,
            coord: p.coord
        })
    }

    console.log("players = ", cleanObjects)
}

console.log("Registering listeners...");
io.on('connection', client => {
    console.log("Someone connected!");

    client.on("playerid", data => {
        let id = data.playerNumber;

        setTimeout(function () {
            client.emit("deadplayer", {
                "player": id
            });
        }, 10000 + Math.floor(Math.random() * 15000));
    });

    var emptyOutputs = 0;

    client.on("objectupdate", data => {

        var greenChecked = false;
        var purpleChecked = false;

        for (dataObject of data) {
            let color = dataObject.ball;

            if(color == "green") greenChecked = true;
            if(color == "purple") purpleChecked = true;
        }

        if(!greenChecked && players["green"]) {
            delete players["green"]
            console.log("deleted green")
        }

        if(!purpleChecked && players["purple"]) {
            delete players["purple"]
            console.log("deleted purple")
        }

        var dataOut = [];

        for (object of data) {
            let x  = object.coord[0];
            let y = object.coord[1];
            let color = object.ball;

            if(!players[color]) {
                players[color] = createPlayer(x, y, pcount++);
            } else {
                players[color].x = x;
                players[color].y = y;
            }

            let player = players[color];

            dataOut.push({
                playerid: player.id,
                color: player.color,
                x: player.x,
                y: player.y
            });

        }

        console.log("DataOut= ", dataOut)

        io.emit("playermove", dataOut);

    });
});

/* SCOREBOARD DEMODATA */
var y = 0;
setInterval(function () {
    var item = items[y++ % items.length];

    io.emit("newplayer", {
        score: "0",
        color: item,
	    name: generateName(),
    });

}, 5000 + Math.floor(Math.random() * 3000));


console.log("Now listening on *:3000");
io.listen(3000);
