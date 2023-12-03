const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Route_E_Week = new Schema({
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

const RouteEWeek = mongoose.model("RouteEWeek", Route_E_Week)

module.exports = RouteEWeek