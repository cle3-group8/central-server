const io = require('socket.io')();
const generateName = require('sillyname');
const items =  ["#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
    "#8BC34A", "#FFEB3B", "#FFC107", "#FF5722"];

var pcount = 0;
var players = [];

function calculateDistance(obj1, obj2) {
    let a = Math.pow((obj1.x - obj1.x), 2);
    let b = Math.pow((obj1.y - obj2.y), 2);

    return Math.sqrt(a + b)
}

function createPlayer(coord) {
    pcount++;

    var item = items[pcount % items.length];

    let p = {
        id: pcount,
        score: "0",
        color: item,
        iterations: 0,
        history: [],
	    name: generateName(),
        coord: coord
    }

    players.push(p);
}

function coordEquals(a, b) {
    return a.x == b.x && a.y == b.y;
}

function checkLeavingObjects() {
    //console.log("Checking for leaving objects....");
    for (var i = 0; i < players.length; i++) {
        let p = players[i];

        let id = p.id;

        if(p.history.length < 3) {
            continue;
        }

        if(coordEquals(p.history[p.history.length - 1], p.history[p.history.length - 2])) {
            //console.log("stilstanding player, ", p.id)
            players.splice(i, 1);
        }
    }

    logPlayers();
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

function syncPreviousEntries() {
    for (p of players) {
        p.iterations++;
        p.history.push(p.coord)
    }
}

function highestPlayerCoord(coords, players) {
    for (p of players) {
        var distances = []

        for (c of coords) {
            distances.push(calculateDistance(p.coord, c));
        }

        let lowestDistanceIndex = distances.indexOf(Math.min.apply(null, distances));
        coords.splice(lowestDistanceIndex, 1);
    }

    if(coords.length < 1) {
        throw new Error(`Unexpected coordinate array length ${coords.length}`);
    }

    return coords[0];
}

function updatePlayerByCoord(coord) {
    var distances = [];

    for (var k = 0; k < players.length; k++) {
        let p = players[k];
        let dis = calculateDistance(coord, p.coord);
        distances.push(Math.floor(dis))
    }

    let match = distances.indexOf(Math.min.apply(null, distances))
    players[match].coord = coord;
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
        if(data.length == 0) {
            if(++emptyOutputs > 2) {
                players = [];
                emptyOutputs = 0;

                io.emit("playersempty", {});

                return;
            }

            return;
        }

        console.log("Data ", data)

        emptyOutputs = 0;

        while (data.length > players.length) {
            let highestCoord = highestPlayerCoord(data, players);
            createPlayer(highestCoord)
        }

        for (coord of data) {
            updatePlayerByCoord(coord)
        }

        checkLeavingObjects();

        var dataOut = [];

        for (player of players) {
            dataOut.push({
                playerid: player.id,
                color: player.color,
                x: player.coord.x,
                y: player.coord.y
            });
        }

        console.log("DataOutput =", dataOut);

        io.emit("playermove", dataOut);

        syncPreviousEntries();
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
