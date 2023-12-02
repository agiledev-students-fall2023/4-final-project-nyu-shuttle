const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_G_Week = new Schema({
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

const RouteGWeek = mongoose.model("RouteGWeek", Route_G_Week)

module.exports = RouteGWeek