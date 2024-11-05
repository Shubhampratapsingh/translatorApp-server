const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { requireAuth } = require("@clerk/express");
const databases = require("./config.js");
const { ID, Query } = require("node-appwrite");

app.use(cors());

const server = http.createServer(app);
const PORT = process.env.PORT || 9000;

//socket io code
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", (room) => {
    console.log("Left room", room);
    socket.leave(room);
  });
});

//db code

async function getData(userId) {
  const res = await databases.listDocuments(
    "672a21380017c6757f4d",
    "672a22fb0023df2b34e3"
  );
  [Query.equal("userid", [userId])];

  return res;
}

async function postData(data) {
  const res = await databases.createDocument(
    "672a21380017c6757f4d",
    "672a22fb0023df2b34e3",
    ID.unique(),
    {
      user1_transcript,
      user2_transcript,
      userid,
      summary,
    }
  );

  return res;
}

async function deleteData(userId, documentID) {
  const res = await databases.deleteDocument(
    "672a21380017c6757f4d",
    "672a22fb0023df2b34e3",
    documentID
  );

  return res;
}

app.get("/test", requireAuth(), (req, res) => {
  const { userId } = req.auth;

  res.json({
    message: "You are authenticated!",
    userId,
  });
});

app.get("/getList", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const data = await getData(userId);
  res.json(data);
});

app.post("/addList", requireAuth(), async (req, res) => {
  const { user1_transcript, user2_transcript, userid, summary } = req.body;
  const data = await postData(
    user1_transcript,
    user2_transcript,
    userid,
    summary
  );

  res.json(data);
});

app.delete("/deleteList", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { documentID } = req.body;
  const data = await deleteData(userId, documentID);

  res.json(data);
});

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
});
