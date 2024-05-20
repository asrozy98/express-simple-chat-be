import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
  },
});

let users = [];
let notification = [];

io.on("connection", (socket) => {
  socket.on("newUser", (data) => {
    data.socketId = socket.id;
    users.push(data);

    io.emit("activeUsers", users);

    console.log(`⚡: ${data.userName}(${socket.id}) just connected!`);
  });

  socket.on("sentMessage", (message) => {
    io.emit("messageResponse", message);
  });

  socket.on("sendNotification", (data) => {
    notification.push(data);
    io.to(data.socketIdRecipient).emit("notificationResponse", notification);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");

    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("activeUsers", users);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
