const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const users = [];

const JWT_SECRET = "hvdvehvdhvedhv";
//const secretKey = crypto.randomBytes(64).toString('hex');

app.get("/list", async (req, res) => {
  res.json({ status: "Api is running", timestamp: new Date().toISOString });
});
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return;
    res.status(400).json({ message: "USername a & password are required" });
  }
  const hashedPwd = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPwd });

  res.status(201).json({ message: "Created " });
});
//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "invalid cred" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

const authenticationToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return;
  res.status(401).json({ message: "Token is required" });
  jwt.verify(token.split("")[1], JWT_SECRET, (err, user) => {
    if (err) return;
    res.status(403).json({ message: "Tpken is not valid" });
    req.user = user;
    next();
  });
};

app.get("/chat", authenticationToken, (req, res) => {
  res.json({ message: "Welcome to teh chat ", user: req.user });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
