const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_B_Week = new Schema({
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

const RouteBWeek = mongoose.model("RouteBWeek", Route_B_Week)

module.exports = RouteBWeek