const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback.js"); 

// a method that constains code to handle feedback-specific routes
const feedbackRouter = () => {
    const router = express.Router();
  
    router.post("/newfeedback", async (req, res, next) => {
    console.log(req.body);
    const { user, timestamp, category, feedback } = req.body;
    if (!user || !timestamp || !category || !feedback) {
        return res.status(401).json({
            success: false,
            message: "Invalid request. Please provide all required fields.",
        });
        next();
    }
    try {
        const newFeedback = await new Feedback({ user, timestamp, category, feedback }).save();
        console.error(`New feedback: ${newFeedback}`);
        return res.json({
          success: true,
          message: "Feedback saved successfully.",
          feedback: newFeedback,
        });
        next();
      } catch (err) {
        console.error(`Failed to save feedback: ${err}`);
        return res.status(500).json({
            success: false,
            message:"Error saving feedback to database.",
            error: err,
          });
        next();
      }
    });
    
    // READ: Get all feedback entries
    router.get("/allfeedback", async (req, res, next) => {
      try {
        const feedbackEntries = await Feedback.find();
        return res.json({
          success: true,
          message: "Feedback retrieved successfully.",
          entries: feedbackEntries,
        });
        next();
      } catch (error) {
        console.error(`Error fetching entries: ${err}`);
        return res.status(500).json({
          success: false,
          message: "Error looking up feedback in database.",
          error: err,
        });
        next();
      }
    });

    //Delete feedback entry
    router.delete("/:id", async (req, res, next) => {
      const id = req.params.id;
      try {
        const deletedFeedback = await Feedback.findByIdAndDelete(id);
        return res.json({
          success: true,
          message: "Feedback deleted successfully.",
          feedback: deletedFeedback,
        });
        next();
      } catch (error) {
        console.error(`Error deleting feedback: ${err}`);
        return res.status(500).json({
          success: false,
          message: "Error deleting feedback in database.",
          error: err,
        });
        next();
      }
    });

  
    return router;
  };
  
  module.exports = feedbackRouter;