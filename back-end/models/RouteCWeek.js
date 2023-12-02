const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_C_Week = new Schema({
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

const RouteCWeek = mongoose.model("RouteCWeek", Route_C_Week)

module.exports = RouteCWeek