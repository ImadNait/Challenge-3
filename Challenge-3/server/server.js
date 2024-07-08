const http = require("http")
const express = require("express");
const app = express();
const socketIo = require("socket.io");
const fs = require("fs");
const PORT = process.env.PORT;
const server = http.Server(app).listen(PORT);
const io = socketIo(server);
const clients = {};


app.use(express.static(__dirname + "/../client/"));
app.use(express.static(__dirname + "/../node_modules/"));

app.get("/", (req, res) => {
    const stream = fs.createReadStream(__dirname + "/../client/index.html");
    stream.pipe(res);
});

var players = {}; 
var unmatched;



io.on("connection", function(socket) {
    let id = socket.id;

    console.log(`Player ${socket.id} has joined!`);
    clients[socket.id] = socket;

    socket.on("disconnect", () => {
        console.log(`Player ${socket.id} has disconnected`);
        delete clients[socket.id];
        socket.broadcast.emit("clientdisconnect", id);
    });

    join(socket); 
    if (opponentOf(socket)) { 
        socket.emit("game.begin", { 
            symbol: players[socket.id].symbol
        });

        opponentOf(socket).emit("game.begin", { 
            symbol: players[opponentOf(socket).id].symbol 
        });
    }



    socket.on("make.move", function(data) {
        if (!opponentOf(socket)) {
            
            return;
        }

        //logger
        socket.emit("move.made", data); 
        opponentOf(socket).emit("move.made", data); 
        console.log(`Player ${socket.id} has made a move`)
    });
    socket.on("gg",()=>{
        console.log(`Player ${socket.id} has won`);

    })
    socket.on("Ws",()=>{
        console.log(`Player ${socket.id} has lost`);

    })


    socket.on("disconnect", function() {
        if (opponentOf(socket)) {
        opponentOf(socket).emit("opponent.left");
        }
    });
});


function join(socket) {
    players[socket.id] = {
        opponent: unmatched,
        symbol: "X",
        socket: socket
    };


    if (unmatched) { 
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else { 
        unmatched = socket.id;
    }
}

function opponentOf(socket) {
    if (!players[socket.id].opponent) {
        return;
    }
    return players[players[socket.id].opponent].socket;
}