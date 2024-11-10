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
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 9000;

//socket io code
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
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
    "672a22fb0023df2b34e3",
    [Query.equal("userid", [userId])]
  );

  return res;
}

async function postData(user1_transcript, user2_transcript, userId, summary) {
  const res = await databases.createDocument(
    "672a21380017c6757f4d",
    "672a22fb0023df2b34e3",
    ID.unique(),
    {
      user1_transcript,
      user2_transcript,
      userid: userId,
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

app.get("/privateTest", requireAuth(), (req, res) => {
  const { userId } = req.auth;

  res.json({
    message: "You are authenticated!",
    userId,
  });
});

app.get("/publicTest", (req, res) => {
  res.json({
    message: "You are not authenticated!",
  });
});

app.get("/getTranscript", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const data = await getData(userId);
  res.json(data);
});

app.post("/addTranscript", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { user1_transcript, user2_transcript, summary } = req.body;
  const data = await postData(
    user1_transcript,
    user2_transcript,
    userId,
    summary
  );

  res.json(data);
});

app.delete("/deleteTranscript/:documentID", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { documentID } = req.params;
  const data = await deleteData(userId, documentID);

  res.json(data);
});

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
});
