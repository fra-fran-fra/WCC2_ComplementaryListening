const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const host = "192.168.0.83";

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("listening on *:3000");
});

let serverNumUsers = 0;

io.on("connection", (socket) => {
  console.log("a user connected");

  serverNumUsers++;
  io.emit('userAdded', {
    numUsers: serverNumUsers
  });

  socket.on("disconnect", () => {
    serverNumUsers--;
    io.emit('userLeft', {
      numUsers: serverNumUsers
    });
  });

  socket.on("freqChange", (data) => {
    socket.broadcast.emit('freqChange', data);
  });

  socket.on("bkgChange", (data) => {
    socket.broadcast.emit('bkgChange', data);
  });
});