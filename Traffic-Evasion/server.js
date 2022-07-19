const path = require("path");
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {cors: {origin: "*"}});

// Establishing socketIO server instance. 
rooms = []

io.on("connection", socket => { 
    // Join existing room with opponent if available.
    matched = false;
    for(let i = 0; i < rooms.length; i++) {
        if(rooms[i].length < 2) {
            rooms[i].push({"socket_id" : socket.id, "score": -1});
            io.to(rooms[i][0]["socket_id"]).emit("start");
            io.to(rooms[i][1]["socket_id"]).emit("start");
            matched = true
            break;
        }
    }
    // No room available, create new room and wait for opponent.
    if(!matched) {
        rooms.push([{"socket_id" : socket.id, "score": -1}]);
    }

    // Handle gameover emitted from client.
    socket.on('gameover', (score) => {
        for(let i = 0; i < rooms.length; i++) {
            if (rooms[i].length == 2) {
                p1 = rooms[i][0];
                p2 = rooms[i][1];

                // If id matches p1.
                if (p1["socket_id"] == socket.id) {
                    p1["score"] = score;
                }
                // If id matches p2.
                else if (p2["socket_id"] == socket.id) {
                    p2["score"] = score;   
                }

                // If both scores received, check who won.
                if (p1["score"] != -1 && p2["score"] != -1) {
                    // p1 won.
                    if(p1["score"] > p2["score"]) {
                        io.to(p1["socket_id"]).emit("victory", "You won " + p1["score"] + " to " + p2["score"] + '!');
                        io.to(p2["socket_id"]).emit("defeat", "You lost " + p2["score"] + " to " + p1["score"] + '!');
                    }
                    // p2 won.
                    else if(p2["score"] > p1["score"]){
                        io.to(p1["socket_id"]).emit("defeat", "You lost " + p1["score"] + " to " + p2["score"] + '!');
                        io.to(p2["socket_id"]).emit("victory", "You won " + p2["score"] + " to " + p1["score"] + '!');
                    }
                    // tie.
                    else {
                        io.to(p1["socket_id"]).emit("tie", "You tied " + p1["score"] + " to " + p2["score"] + "!");
                        io.to(p2["socket_id"]).emit("tie", "You tied " + p1["score"] + " to " + p2["score"] + "!");
                    }
                    // Remove room from list.
                    rooms.splice(i, 1);
                    break;
                }
            }
        }
    });

    // Handle client disconnect.
    socket.on('disconnect', function () {
        for(let i = 0; i < rooms.length; i++) {
            // If the game hasn't started, just delete room.
            if(rooms[i].length == 1) {
                p1 = rooms[i][0];
                if(p1["socket_id"] == socket.id) {
                    rooms.splice(i, 1);
                }
            }
            // If the game started, disconnected player loses and opponent wins.
            else if(rooms[i].length == 2) {
                p1 = rooms[i][0];
                p2 = rooms[i][1];
                if(p1["socket_id"] == socket.id) {
                    io.to(p2["socket_id"]).emit("victory", "Opponent disconnected. You won!");
                    rooms.splice(i, 1);
                    console.log(rooms);
                }
                if(p2["socket_id"] == socket.id) {  
                    io.to(p1["socket_id"]).emit("victory", "Opponent disconnected. You won!");
                    rooms.splice(i, 1);
                    console.log(rooms);
                }
            }
        }
    });
    console.log(rooms);
});


// Web server config. 
app.use(express.static("public"));

httpServer.listen(3000, () => {
    console.log("Server running on port 3000.")
});