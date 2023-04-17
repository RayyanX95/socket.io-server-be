const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const index = require("./routes/index");

const app = express();
app.use(cors());

app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("User joined with session id:", socket.id);

  socket.on("message", (data) => {
    console.log("Received a message:", data);
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
