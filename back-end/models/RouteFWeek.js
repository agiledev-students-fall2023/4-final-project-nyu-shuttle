const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_F_Week = new Schema({
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

const RouteFWeek = mongoose.model("RouteFWeek", Route_F_Week)

module.exports = RouteFWeek