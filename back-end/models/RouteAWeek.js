// a mongoose model of a feedback entry 
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_A_Week = new Schema({
  stop_name: {
    type: String,
    unique: false,
    required: true,
  },
  times: {
    type: [String],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
}, { 
    unique: false, 
})

const RouteAWeek = mongoose.model("RouteAWeek", Route_A_Week)

module.exports = RouteAWeek