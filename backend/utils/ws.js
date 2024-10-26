import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import prisma from "./prismaClient.js";

function InitializeWSServer(server) {
  const wss = new WebSocketServer({ server });

  let activeUsers = {};

  wss.on("connection", (ws) => {
    // todo
    authenticateToken(ws, () => {
      const userId = ws.user.id;
      activeUsers[userId] = ws; // store user's ws connection
      console.log("new connection established", userId);

      // handle incoming messages
      ws.on("message", async (message) => {
        const { receiverId, content } = JSON.parse(message);
        console.log("new Message received: ", content);

        if (!receiverId) ws.close(1008, "Receiver Id not available");

        const receiverExists = await prisma.user.findFirst({
          where: {
            id: receiverId,
          },
        });

        if (!receiverExists) {
          ws.close(1008, "Receiver not exists");
          return;
        }

        const savedMessage = await prisma.message.create({
          data: {
            sender_id: userId,
            receiver_id: receiverId,
            content,
          },
        });

        console.log(savedMessage);
        console.log();
        if (activeUsers[receiverId]) {
          activeUsers[receiverId].send(
            JSON.stringify({
              sender_id: userId,
              receiver_id: receiverId,
              content,
              createdAt: savedMessage.createdAt,
            })
          );
        }

        activeUsers[userId].send(
          JSON.stringify({
            sender_id: userId,
            receiver_id: receiverId,
            content,
            createdAt: savedMessage.createdAt,
          })
        );
      });

      ws.on("close", () => {
        delete activeUsers[userId];
      });
    });
  });
}

const authenticateToken = (ws, next) => {
  const token = ws.protocol;
  if (!token) return ws.close(1008, "No authentication token provided");

  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) return ws.close();

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) ws.close(1008, "User not found");
    else ws.user = user;

    next();
  });
};

export default InitializeWSServer;
