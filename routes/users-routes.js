const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const secret = "chatroom-secret";

const VALID_USERS = ["Rayyan", "Chrome", "Edge", "Medo"];

router.post("/login", (req, res, next) => {
  // Authenticate user and get user ID
  const userId = req.body.username;
  const password = req.body.password;
  console.log("req", userId, password);

  if (VALID_USERS.includes(userId) && password === "123") {
    // Generate JWT token for user
    const token = jwt.sign({ userId }, secret, { algorithm: "HS256" });

    res.status(200).send({ token });
    return next();
  }

  res.status(401).send({
    error: {
      message: "Your username or password was incorrect. ",
      status: 401,
    },
  });
});

module.exports = router;
