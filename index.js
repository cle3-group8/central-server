const io = require('socket.io')();
const generateName = require('sillyname');

function calculateDistance(obj1, obj2) {
    let a = Math.pow((obj1.x - obj1.x), 2);
    let b = Math.pow((obj1.y - obj2.y), 2);

    return Math.sqrt(a + b)
}

var players = [];

const items =  ["#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
    "#8BC34A", "#FFEB3B", "#FFC107", "#FF5722"];

var pcount = 0;

function createPlayer(coord) {
    console.log(pcount)
    pcount++;

    var item = items[pcount % items.length];

    let p = {
        id: pcount,
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

    var zeroRate = 0;
    var removalZeroRate = 0;

    client.on("objectupdate", data => {
        if(data.length == 0) {
            //console.log("emoty update rated at", zeroRate)
            zeroRate++;
            //console.log(zeroRate)

            if(zeroRate == 2) {
                zeroRate = 0;
                removalZeroRate = 0;
                players = [];
                //console.log("EMPTIED")
                return;
            }

            return;
        };

        zeroRate = 0;

        //console.log(JSON.stringify(players));

        let outArray = [];

        var firstIteration = false;

        if(players.length == 0) {
            firstIteration = true;
        }

        console.log(data)

        for (var j = 0; j < data.length; j++) {
            let coord = data[j];

            if(firstIteration) {
                createPlayer(coord);
                console.log("Created Player!")
            }

            while(players.length > data.length) {
                console.log("Removing one!")
                let furthestawaydis = -1;
                let highestp = 0;

                if(removalZeroRate == 2) {
                    removalZeroRate = 0;

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
                } else {
                    break;
                }
            }

            var distances = [];

            for (var k = 0; k < players.length; k++) {
                let p = players[k];
                let dis = calculateDistance(coord, p.coord);
                console.log("Distance iteration")
                distances.push(Math.floor(dis))
            }

		    console.log(distances)

            let highest = distances.indexOf(Math.min.apply(null, distances))
            players[highest].coord = coord;

            let player = players[highest];

            outArray.push({
                playerid: player.id,
                color: player.color,
                x: player.coord.x,
                y: player.coord.y
            })
        }

       console.log(outArray);
       io.emit("playermove", outArray);
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
