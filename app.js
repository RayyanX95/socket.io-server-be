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

const decodeToken = (token, secret) => {
  let decodedToken = null;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("Error decoding JWT:", err);
    } else {
      console.log("Decoded JWT:", decoded);
      decodedToken = decoded;
    }
  });

  return decodedToken;
};

io.on("connection", (socket) => {
  // writeSocketObjectToFile(socket);
  socket.on("message", (data) => {
    const authToken = socket.handshake.auth.token;

    if (!authToken) {
      return socket.emit(
        "unauthorized",
        "You must be logged in to send messages"
      );
    }
    const token = authToken && authToken?.split("Bearer ")[1];

    const decodedToken = decodeToken(token, secret);

    if (!decodedToken) {
      return socket.emit(
        "unauthorized",
        "Invalid token, please try to sign in again"
      );
    }
    if (decodedToken.userId !== "Rayyan") {
      return socket.emit("message", "Unregistered user!");
    }
    console.log("Received a message:", data);
    socket.broadcast.emit("message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
