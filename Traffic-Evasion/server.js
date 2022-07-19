const path = require("path");
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {cors: {origin: "*"}});

app.use(express.static("public"));

io.on("connection", socket => { 
    console.log("Connected with: " + socket.id)

    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

httpServer.listen(3000, () => {
    console.log("Server running on port 3000.")
});


  
    