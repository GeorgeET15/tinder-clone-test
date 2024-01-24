const PORT = process.env.PORT || 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
const http = require("http"); // Import the 'http' module
require("dotenv").config();

const uri = process.env.URI;
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Attach Socket.IO to the server

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://tinder-clone-test-sand.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const client = new MongoClient(uri);

app.get("/", (req, res) => {
  res.json("Hello to my app");
});

app.post("/signup", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();

    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
    };

    const insertedUser = await users.insertOne(data);

    const token = jwt.sign(insertedUser, sanitizedEmail, {
      expiresIn: 60 * 24,
    });
    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const user = await users.findOne({ email });
    const correctPassword = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (user && correctPassword) {
      const token = jwt.sign(user, email, { expiresIn: 60 * 24 });
      res.status(201).json({ token, userId: user.user_id });
    }
    res.status(400).send("Invalid Credentials");
  } catch (error) {
    console.log(error);
  }
});

app.get("/gendered-users", async (req, res) => {
  const client = new MongoClient(uri);
  const gender = req.query.gender;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const query = { gender_identity: { $eq: gender } };
    const sortCondition = { _id: 1 };
    const foundUsers = await users.find(query).sort(sortCondition).toArray();

    res.send(foundUsers);
  } finally {
    await client.close();
  }
});

app.get("/user", async (req, res) => {
  const client = new MongoClient(uri);
  const userId = req.query.userId;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const query = { user_id: userId };
    const user = await users.findOne(query);
    res.send(user);
  } finally {
    await client.close();
  }
});

app.put("/user", async (req, res) => {
  const client = new MongoClient(uri);
  const formData = req.body.formData;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const query = { user_id: formData.user_id };
    const updateDocument = {
      $set: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        branch: formData.branch,
        current_year: formData.current_year,
        dob_day: formData.dob_day,
        dob_month: formData.dob_month,
        dob_year: formData.dob_year,
        show_gender: formData.show_gender,
        gender_identity: formData.gender_identity,
        gender_interest: formData.gender_interest,
        url: formData.url,
        about: formData.about,
        matches: formData.matches,
      },
    };

    const inserteduser = await users.updateOne(query, updateDocument);
    res.send(inserteduser);
  } finally {
    await client.close();
  }
});

app.put("/addmatch", async (req, res) => {
  const client = new MongoClient(uri);
  const { userId, matchedUserId } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const query = { user_id: userId };
    const updateDocument = {
      $push: { matches: { user_id: matchedUserId } },
    };
    const user = await users.updateOne(query, updateDocument);
    res.send(user);
  } finally {
    await client.close();
  }
});

app.post("/remove-match", async (req, res) => {
  const client = new MongoClient(uri);
  const { userId, matchUserId } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const messages = database.collection("messages");

    const matchQuery = { user_id: userId };
    const matchUpdateDocument = {
      $pull: { matches: { user_id: matchUserId } },
    };
    await users.updateOne(matchQuery, matchUpdateDocument);

    const reverseMatchQuery = { user_id: matchUserId };
    const reverseMatchUpdateDocument = {
      $pull: { matches: { user_id: userId } },
    };
    await users.updateOne(reverseMatchQuery, reverseMatchUpdateDocument);

    const messageQuery = {
      $or: [
        { from_userId: userId, to_userId: matchUserId },
        { from_userId: matchUserId, to_userId: userId },
      ],
    };
    await messages.deleteMany(messageQuery);

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing match:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

app.get("/users", async (req, res) => {
  const client = new MongoClient(uri);
  const userId = JSON.parse(req.query.userId);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const pipeline = [
      {
        $match: {
          user_id: {
            $in: userId,
          },
        },
      },
    ];

    const foundUsers = await users.aggregate(pipeline).toArray();

    res.json(foundUsers);
  } finally {
    await client.close();
  }
});

app.get("/messages", async (req, res) => {
  const { userId, correspondingUserId } = req.query;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("app-data");
    const messages = database.collection("messages");

    const query = {
      $or: [
        { from_userId: userId, to_userId: correspondingUserId },
        { from_userId: correspondingUserId, to_userId: userId },
      ],
    };

    const foundMessages = await messages.find(query).toArray();
    res.send(foundMessages);
  } finally {
    await client.close();
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("message", async (message) => {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const database = client.db("app-data");
      const messages = database.collection("messages");

      const insertedMessage = await messages.insertOne(message);
      io.emit("message", message);
    } finally {
      await client.close();
    }
  });
});

app.delete("/delete-user", async (req, res) => {
  const client = new MongoClient(uri);
  const userIdToDelete = req.body.userId;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const deletionQuery = { user_id: userIdToDelete };
    await users.deleteOne(deletionQuery);

    const messagesQuery = {
      $or: [{ from_userId: userIdToDelete }, { to_userId: userIdToDelete }],
    };
    await messages.deleteMany(messagesQuery);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

server.listen(PORT, () => {
  console.log("Server running on PORT " + PORT);
});
