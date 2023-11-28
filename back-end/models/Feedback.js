// a mongoose model of a feedback entry 
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FeedbackSchema = new Schema({
  user: {
    type: String,
    unique: true,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  feedback:{
    type: String,
    required: true,
  },
})

const Feedback = mongoose.model("Feedback", FeedbackSchema)

module.exports = Feedback