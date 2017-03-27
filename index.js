const io = require('socket.io')();
const generateName = require('sillyname');

function calculateDistance(obj1, obj2) {
    let a = Math.pow((obj1.x * obj2.x), 2);
    let b = Math.pow((obj1.y * obj2.y), 2);

    return Math.sqrt(a + b)
}

var players = [];

const items =  ["#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
    "#8BC34A", "#FFEB3B", "#FFC107", "#FF5722"];
    var item = items[i % items.length];

var i = 0;

function createPlayer(coord) {
    i++;

    let p = {
        id: i,
        score: "0",
        color: item,
	    name: generateName(),
        coord: coord
    }

    players.push(p);
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

    client.on("objectupdate", data => {
        if(data.length == 0) {
            players = [];
            return;
        };

        console.log(JSON.stringify(players));


        var firstIteration = false;

        if(players.length == 0) {
            firstIteration = true;
        }

        for (var j = 0; j < data.length; j++) {
            let coord = data[j];

            if(firstIteration) {
                createPlayer(coord);
                console.log("Created Player!")
                continue;
            }

            while(players.length > data.length) {
                let furthestawaydis = -1;
                let highestp = 0;

                for (var l = 0; l < players.length; l++) {
                    let p = players[l];
                    let dis = calculateDistance(coord, p.coord)

                    if(dis > 30) {
                        furthestawaydis = dis;
                        highestp = l
                        break;
                    }
                }

                players.splice(highestp, 1);
            }

            var distances = [];

            for (var k = 0; k < players.length; k++) {
                let p = players[k];
                let dis = calculateDistance(coord, p.coord);
                distances.push(Math.floor(dis))
            }

            let highest = distances.indexOf(Math.min.apply(null, distances))
            players[highest].coord = coord;

            let player = players[highest];
            io.emit("playermove", [{
                id: player.id,
                color: player.color,
                x: player.coord.x,
                y: player.coord.y
            }]);
        }
    });
});

/* SCOREBOARD DEMODATA
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
var color = items[Math.floor(Math.random() * items.length)];

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/* PROJECTIE DEMO DATA
setInterval(function() {
    var boolX = Math.random() >= 0.4;
    var boolY = Math.random() >= 0.4;

    io.emit("playermove", [{
        id: playerId,
        color: color, // DEBUGGING
        x: boolX ? (x += Math.floor(Math.random() * 5)) : (x -= Math.floor(Math.random() * 5)),
        y: boolY ? (x += Math.floor(Math.random() * 5)) : (x -= Math.floor(Math.random() * 5))
    }]);

    if(x > 500) {
        x = 0; y = 0; ++playerId;
        color = items[i % items.length];
    }
}, 100);*/

console.log("Now listening on *:3000");
io.listen(3000);
