const express = require("express"); 

// mongoose models for MongoDB data manipulation
const mongoose = require("mongoose");
const User = require("../models/User.js");

const authenticationRouter = () => {
  const router = express.Router();

  router.post("/signup", async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      res.status(401).json({
        success: false,
        message: `No username or password supplied.`,
      });
      next();
    }

    // try to create a new user
    try {
      const user = await new User({ username, password }).save();
      console.error(`New user: ${user}`);
      const token = user.generateJWT();
      res.json({
        success: true,
        message: "User saved successfully.",
        token: token,
        username: user.username,
      }); 
      next();
    } catch (err) {
      console.error(`Failed to save user: ${err}`);
      res.status(500).json({
        success: false,
        message: "Error saving user to database.",
        error: err,
      });
      next();
    }
  });

  // a route to handle login attempts requested to /auth/login
  router.post("/login", async function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      res
        .status(401)
        .json({ success: false, message: `No username or password supplied.` });
      next();
    }

    // find this user in the database
    try {
      const user = await User.findOne({ username: username }).exec();
      if (!user) {
        console.error(`User not found.`);
        res.status(401).json({
          success: false,
          message: "User not found in database.",
        });
        next();
      }
      else if (!user.validPassword(password)) {
        console.error(`Incorrect password.`);
        res.status(401).json({
          success: false,
          message: "Incorrect password.",
        });
        next();
      }
      
      console.log("User logged in successfully.");
      const token = user.generateJWT(); 
      res.json({
        success: true,
        message: "User logged in successfully.",
        token: token,
        username: user.username,
      }); 
      next();
    } catch (err) {
      console.error(`Error looking up user: ${err}`);
      res.status(500).json({
        success: false,
        message: "Error looking up user in database.",
        error: err,
      });
      next();
    }
  });

  // a route to handle logout requests
  router.get("/logout", function (req, res, next) {
    res.json({
      success: true,
      message:
        "There is actually nothing to do on the server side... you simply need to delete your token from the browser's local storage!",
    });
    next();
  });

  return router;
};

module.exports = authenticationRouter;