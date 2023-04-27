const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const index = require("./routes/index");
const usersRoutes = require("./routes/users-routes");
const writeSocketObjectToFile = require("./utils/write-socket-object-to-file");

const app = express();
const secret = "chatroom-secret";

const server = http.createServer(app);
const io = socketIo(server, {
  cors: true, //* Allow CORS Origins for SocketIO
});

app.use(cors());

//* Add body-parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//* Add real cases middleware
app.use(index);

//* Users routes: Signup, Login, authentications, ...
app.use("/api/users", usersRoutes);

io.on("connection", (socket) => {
  console.log("a user connected");

  // authenticate the connection using JWT
  const token = socket.handshake.auth.token;
  let userId = "";
  try {
    const decoded = jwt.verify(token, secret);
    userId = decoded.userId;
    // authentication successful
    console.log("authenticated user:", userId);
  } catch (error) {
    // authentication failed
    console.error("authentication error:", error.message);
    socket.disconnect();
    console.log("user disconnected");

    return;
  }

  socket.on("joinRoom", (roomId) => {
    console.log(`${userId} joining room ${roomId}`);
    socket.join(roomId);

    // handle chat messages
    socket.on("message", (message) => {
      // broadcast the message to all clients in the room
      socket.broadcast.to(roomId).emit("message", message);
    });

    socket.on("leaveRoom", (roomId) => {
      console.log(`${userId} leaving room ${roomId}`);
      socket.leave(roomId);
    });
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // handle disconnect events
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
