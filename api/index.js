import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = "365410199597-drvdciuelu558n4u1igpi94c78kmnrir.apps.googleusercontent.com";
const JWT_SECRET = "6d7s8d6v5f4d5e6sd78e9d0ss65fg7h86f7d4c5ff6g7ds8s5d4c5f6g7h8r99d0g";

let api = express.Router();
let Videos;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  let connection = await MongoClient.connect("mongodb://127.0.0.1");
  let db = connection.db("favtube");
  Videos = db.collection("videos");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

// FavTube

api.get("/videos", async (req, res) => {
  let videos = await Videos.find().toArray();
  res.json({ videos: videos });
});

api.get("/videos/:title", async (req, res) => {
  let title = req.params.title;
  let allVideos = await Videos.find({ title: { $regex: title } }).toArray();
  let videos = [];
  for (let video of allVideos) {
    videos.push(video.title);
  }
  res.json({ videos: videos }); // there could be 0 videos
});

api.post("/videos", async (req, res) => {
  let newVid = req.body;
  let newTitle = newVid.title;
  if (!newTitle || newTitle === "") {
    res.status(400).json({ error: "Missing video" });
    return;
  }
  let isFavorite = await Videos.findOne(newVid); // check if video is already in favorites
  if (isFavorite) {
    res.status(400).json({ error: `${newTitle} already exists` });
    return;
  }
  await Videos.insertOne(newVid);
  delete newVid._id;
  res.json(newVid);
});

api.delete("/videos", async (req, res) => {
  let oldVid = req.body;
  let oldTitle = oldVid.title;
  if (!oldTitle || oldTitle === "") {
    res.status(400).json({ error: "Missing video" });
    return;
  }
  await Videos.deleteOne(oldVid);
  res.json({ success: true });
});

// Login with Google

api.post("/google/login", async (req, res) => {
  let idToken = req.body.idToken;
  let client = new OAuth2Client();
  let data;
  try {
    /* "audience" is the client ID the token was created for. A mismatch would mean the user is
       trying to use an ID token from a different app */
    let login = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
    data = login.getPayload();
  } catch (e) {
    /* Something when wrong when verifying the token. */
    console.error(e);
    res.status(403).json({ error: "Invalid ID token" });
  }

  /* data contains information about the logged in user. */
  let email = data.email;
  let name = data.name;
  console.log(name);

  let apiKey = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ apiKey });
});

api.use("/protected", async (req, res, next) => {
  /* Return an authentication error. */
  const error = () => {
    res.status(403).json({ error: "Access denied" });
  };
  let header = req.header("Authorization");
  /* `return error()` is a bit cheesy when error() doesn't return anything, but it works (returns undefined) and is convenient. */
  if (!header) return error();
  let [type, value] = header.split(" ");
  if (type !== "Bearer") return error();
  try {
    let verified = jwt.verify(value, SECRET);
    console.log(verified);
    next();
  } catch (e) {
    console.error(e);
    error();
  }
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
